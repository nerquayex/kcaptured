#!/usr/bin/env node
/*
  portfolio_db_cleanup.js

  Read-only discovery -> internal diff -> apply updates/deletes -> validate
*/
const fs = require('fs')
const path = require('path')
const { Pool } = require('@neondatabase/serverless')

function extractPublicIdFromUrl(url) {
    try {
        const m = url.match(/\/v\d+\/(.+?)\.(?:jpg|jpeg|png|webp|gif)$/i)
        if (m) return m[1]
        return null
    } catch (e) { return null }
}

function normalizeUrl(url) {
    try {
        const u = new URL(url)
        // keep protocol+host
        const pathname = u.pathname
        // find /upload/ and the /v<digits>/ that precedes public id
        const up = pathname.indexOf('/upload/')
        if (up === -1) return u.origin + pathname
        const after = pathname.substring(up + '/upload/'.length)
        const vIdx = after.search(/v\d+\//)
        if (vIdx === -1) {
            return u.origin + '/upload/' + after
        }
        const publicPart = after.substring(vIdx)
        return u.origin + '/upload/' + publicPart
    } catch (e) { return url }
}

function parsePortfolioData(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const regex = /\{[^}]*cloudinaryUrl:\s*'([^']+)'[^}]*category:\s*'([^']+)'[^}]*\}/gs
    const entries = []
    let m
    while ((m = regex.exec(content)) !== null) {
        const url = m[1]
        const category = m[2]
        const publicId = extractPublicIdFromUrl(url)
        entries.push({ cloudinaryUrl: url, category, publicId, normalized: normalizeUrl(url) })
    }
    return entries
}

async function main() {
    const repoRoot = path.resolve(__dirname, '..')
    const pdPath = path.join(repoRoot, 'lib', 'portfolio-data.ts')
    if (!fs.existsSync(pdPath)) {
        console.error('lib/portfolio-data.ts not found')
        process.exit(1)
    }

    // Load .env.local or .env into process.env if present (safe parse)
    for (const name of ['.env.local', '.env']) {
        const envPath = path.join(repoRoot, name)
        if (!fs.existsSync(envPath)) continue
        try {
            const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
            for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed || trimmed.startsWith('#')) continue
                const idx = trimmed.indexOf('=')
                if (idx === -1) continue
                const key = trimmed.substring(0, idx).trim()
                let val = trimmed.substring(idx + 1).trim()
                if ((val.startsWith("\'") && val.endsWith("\'")) || (val.startsWith('"') && val.endsWith('"'))) {
                    val = val.substring(1, val.length - 1)
                }
                if (!(key in process.env)) process.env[key] = val
            }
            break
        } catch (e) {
            // ignore parse errors
        }
    }

    const portfolio = parsePortfolioData(pdPath)
    console.log('[info] portfolio-data images discovered:', portfolio.length)

    const DATABASE_URL = process.env.DATABASE_URL
    if (!DATABASE_URL) {
        console.error('DATABASE_URL is not set in environment; aborting.')
        process.exit(1)
    }

    const pool = new Pool({ connectionString: DATABASE_URL })

    const { rows } = await pool.query('SELECT * FROM portfolio_items')
    console.log('[info] db rows before cleanup:', rows.length)

    // Build lookup maps
    const byPublicId = new Map()
    const byNormalized = new Map()
    for (const p of portfolio) {
        if (p.publicId) byPublicId.set(p.publicId, p)
        byNormalized.set(p.normalized, p)
    }

    const toUpdate = []
    const toDelete = []
    const keep = []

    // helper to get normalized and public id from row
    function rowKeys(row) {
        const public_id = row.public_id || extractPublicIdFromUrl(row.cloudinary_url || '')
        const normalized = normalizeUrl(row.cloudinary_url || '')
        return { public_id, normalized }
    }

    // detect duplicates by public_id or normalized url
    const groupByKey = new Map()

    for (const row of rows) {
        const { public_id, normalized } = rowKeys(row)
        let matched = null
        if (public_id && byPublicId.has(public_id)) matched = byPublicId.get(public_id)
        else if (byNormalized.has(normalized)) matched = byNormalized.get(normalized)

        // accumulate group key
        const gKey = public_id || normalized
        if (!groupByKey.has(gKey)) groupByKey.set(gKey, [])
        groupByKey.get(gKey).push(row)

        if (!matched) {
            toDelete.push({ row, reason: 'not-in-portfolio-data' })
            continue
        }

        // matched; check category
        if (String(row.category) !== String(matched.category)) {
            toUpdate.push({ row, desiredCategory: matched.category })
        } else {
            keep.push(row)
        }
    }

    // handle duplicates: for each group with >1 rows, choose best to keep
    const duplicatesToRemove = []
    for (const [key, group] of groupByKey.entries()) {
        if (group.length <= 1) continue
        // score rows
        const scored = group.map((r) => {
            let score = 0
            if (r.title) score += 1
            if (r.caption) score += 1
            if (r.width) score += 1
            if (r.height) score += 1
            if (r.featured) score += 2
            if (r.active) score += 1
            if (r.sort_order && r.sort_order > 0) score += 1
            return { r, score }
        })
        scored.sort((a, b) => b.score - a.score)
        const keeper = scored[0].r
        for (let i = 1; i < scored.length; i++) {
            duplicatesToRemove.push({ row: scored[i].r, keepId: keeper.id })
        }
    }

    // Avoid double-deleting rows that are both in toDelete and duplicatesToRemove
    const toDeleteIds = new Set(toDelete.map(x => x.row.id))
    const dupRemoveIds = new Set(duplicatesToRemove.map(x => x.row.id))
    const finalDupRemoves = duplicatesToRemove.filter(x => !toDeleteIds.has(x.row.id))

    // Internal comparison summary
    console.log('[summary] total_rows:', rows.length)
    console.log('[summary] matched_rows:', rows.length - toDelete.length)
    console.log('[summary] to_update_count:', toUpdate.length)
    console.log('[summary] duplicates_to_remove_count:', finalDupRemoves.length)
    console.log('[summary] to_delete_count (not in portfolio):', toDelete.length)

    // Apply changes in a transaction
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // updates
        for (const u of toUpdate) {
            await client.query('UPDATE portfolio_items SET category = $1, updated_at = now() WHERE id = $2', [u.desiredCategory, u.row.id])
        }

        // delete duplicates
        for (const d of finalDupRemoves) {
            await client.query('DELETE FROM portfolio_items WHERE id = $1', [d.row.id])
        }

        // delete unmatched
        for (const d of toDelete) {
            await client.query('DELETE FROM portfolio_items WHERE id = $1', [d.row.id])
        }

        await client.query('COMMIT')
    } catch (err) {
        await client.query('ROLLBACK')
        console.error('[error] during DB changes:', err)
        process.exit(1)
    } finally {
        client.release()
    }

    // Validate final state
    const { rows: finalRows } = await pool.query('SELECT * FROM portfolio_items')
    // compute final stats
    const counts = finalRows.reduce((acc, r) => { acc[r.category] = (acc[r.category] || 0) + 1; return acc }, {})

    console.log('[final] total_rows:', finalRows.length)
    console.log('[final] counts_by_category:', counts)
    console.log('[final] removed_records_count:', toDelete.length + finalDupRemoves.length)
    console.log('[final] updated_categories_count:', toUpdate.length)

    await pool.end()
    console.log('[done] cleanup complete')
}

main().catch((e) => { console.error(e); process.exit(1) })
