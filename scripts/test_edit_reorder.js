const fs = require('fs')
const path = require('path')
const { Pool } = require('@neondatabase/serverless')

const envFile = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envFile)) {
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function testEdit() {
  console.log('Testing edit...')
  const res = await pool.query('SELECT id, title, caption, category, featured, active FROM portfolio_items ORDER BY sort_order ASC LIMIT 1')
  if (res.rowCount === 0) { console.log('No rows'); return }
  const row = res.rows[0]
  console.log('Original:', row)
  const id = row.id
  const original = { ...row }

  await pool.query('UPDATE portfolio_items SET title = $1, caption = $2, category = $3, featured = $4, active = $5 WHERE id = $6', ['E2E Test Title', 'E2E caption', 'test-e2e', true, false, id])
  const after = (await pool.query('SELECT id, title, caption, category, featured, active FROM portfolio_items WHERE id = $1', [id])).rows[0]
  console.log('After update:', after)

  // revert
  await pool.query('UPDATE portfolio_items SET title = $1, caption = $2, category = $3, featured = $4, active = $5 WHERE id = $6', [original.title, original.caption, original.category, original.featured, original.active, id])
  const reverted = (await pool.query('SELECT id, title, caption, category, featured, active FROM portfolio_items WHERE id = $1', [id])).rows[0]
  console.log('Reverted:', reverted)
}

async function testReorder() {
  console.log('Testing reorder...')
  const res = await pool.query('SELECT id, sort_order FROM portfolio_items ORDER BY sort_order ASC LIMIT 2')
  if (res.rowCount < 2) { console.log('Not enough rows for reorder test'); return }
  const a = res.rows[0]
  const b = res.rows[1]
  console.log('Original orders:', a, b)

  // swap
  await pool.query('BEGIN')
  await pool.query('UPDATE portfolio_items SET sort_order = $1 WHERE id = $2', [b.sort_order, a.id])
  await pool.query('UPDATE portfolio_items SET sort_order = $1 WHERE id = $2', [a.sort_order, b.id])
  await pool.query('COMMIT')

  const afterA = (await pool.query('SELECT id, sort_order FROM portfolio_items WHERE id = $1', [a.id])).rows[0]
  const afterB = (await pool.query('SELECT id, sort_order FROM portfolio_items WHERE id = $1', [b.id])).rows[0]
  console.log('After swap:', afterA, afterB)

  // revert
  await pool.query('BEGIN')
  await pool.query('UPDATE portfolio_items SET sort_order = $1 WHERE id = $2', [a.sort_order, a.id])
  await pool.query('UPDATE portfolio_items SET sort_order = $1 WHERE id = $2', [b.sort_order, b.id])
  await pool.query('COMMIT')

  const revA = (await pool.query('SELECT id, sort_order FROM portfolio_items WHERE id = $1', [a.id])).rows[0]
  const revB = (await pool.query('SELECT id, sort_order FROM portfolio_items WHERE id = $1', [b.id])).rows[0]
  console.log('Reverted orders:', revA, revB)
}

;(async () => {
  try {
    await testEdit()
    await testReorder()
  } catch (e) {
    console.error('Error', e)
  } finally {
    await pool.end()
  }
})()
