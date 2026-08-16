const fs = require('fs')
const path = require('path')
const { Pool } = require('@neondatabase/serverless')
const { v2: cloudinary } = require('cloudinary')

function loadEnv() {
    const envFile = path.join(__dirname, '..', '.env.local')
    if (!fs.existsSync(envFile)) return
    const env = fs.readFileSync(envFile, 'utf8')
    env.split(/\n/).forEach((l) => {
        const t = l.trim()
        if (!t || t.startsWith('#')) return
        const i = t.indexOf('=')
        if (i === -1) return
        let v = t.slice(i + 1)
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
        process.env[t.slice(0, i)] = v
    })
}

function parseStaticTestimonials() {
    const file = path.join(__dirname, '..', 'lib', 'testimonials-data.ts')
    const src = fs.readFileSync(file, 'utf8')
    // crude regex to extract static testimonial objects
    const entryRe = /\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?clientName:\s*'([^']+)'[\s\S]*?clientRole:\s*'([^']+)'[\s\S]*?content:\s*'([^']+)'[\s\S]*?(?:videoUrl:\s*'([^']+)')?/g
    const testimonials = []
    let m
    while ((m = entryRe.exec(src)) !== null) {
        const id = m[1]
        const clientName = m[2]
        const clientRole = m[3]
        const content = m[4]
        const videoUrl = m[5]
        testimonials.push({ id, clientName, clientRole, content, videoUrl })
    }
    return testimonials
}

loadEnv()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function fetchCloudinaryTestimonials() {
    if (!process.env.CLOUDINARY_API_KEY) return []
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    try {
        const response = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'testimonials',
            max_results: 100,
            resource_type: 'video',
            direction: 'desc',
            context: true,
            tags: true,
        })

        return (response.resources || []).map((r) => {
            const ctx = r.context && r.context.custom
            const clientName = ctx?.clientName || 'Client'
            const clientRole = ctx?.clientRole || 'Testimonial'
            const content = ctx?.content || ''
            return {
                id: r.public_id,
                clientName,
                clientRole,
                content,
                videoUrl: r.secure_url,
                videoPublicId: r.public_id,
            }
        })
    } catch (e) {
        console.error('cloudinary fetch failed', e && e.message ? e.message : e)
        return []
    }
}

async function main() {
    try {
        const staticTestimonials = parseStaticTestimonials()
        console.log('static parsed:', staticTestimonials.length)

        const cloudTestimonials = await fetchCloudinaryTestimonials()
        console.log('cloudinary found:', cloudTestimonials.length)

        const all = [...cloudTestimonials, ...staticTestimonials]

        let inserted = 0
        let updated = 0

        // Ensure table exists (safe)
        await pool.query(fs.readFileSync(path.join(__dirname, '..', 'drizzle', 'migrations', '0002_create_testimonials.sql'), 'utf8'))

        for (const t of all) {
            const id = t.id || `static-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            const sql = `INSERT INTO testimonials (id, client_name, client_role, content, video_url, video_public_id, image_url, active, featured, sort_order, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now(), now())
        ON CONFLICT (id) DO UPDATE SET client_name = EXCLUDED.client_name, client_role = EXCLUDED.client_role, content = EXCLUDED.content, video_url = EXCLUDED.video_url, video_public_id = EXCLUDED.video_public_id, updated_at = now()`
            const params = [id, t.clientName || 'Client', t.clientRole || 'Testimonial', t.content || '', t.videoUrl || null, t.videoPublicId || null, t.imageUrl || null, true, false, 0]
            const res = await pool.query(sql, params)
            if (res && res.rowCount && res.rowCount > 0) inserted++
            else updated++
            console.log('Upserted', id)
        }

        console.log('Done. inserted=', inserted, 'updated=', updated)
    } catch (e) {
        console.error('ERROR', e && e.message ? e.message : e)
    } finally {
        await pool.end()
    }
}

main()
