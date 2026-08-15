import { pool } from '@/lib/db'
import { services as staticServices } from '@/lib/services-data'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const res = await pool.query('SELECT id, category, name, duration, price, features, sample_url, sort_order, active FROM packages WHERE active = true ORDER BY sort_order ASC')
    const rows = (res?.rows ?? []).map((r: any) => ({
      id: r.id,
      category: r.category,
      name: r.name,
      duration: r.duration,
      price: r.price,
      features: r.features || [],
      sampleUrl: r.sample_url || null,
      sortOrder: r.sort_order,
      active: r.active,
    }))

    // If DB has any rows, prefer them; otherwise fallback to staticServices
    const out = rows.length > 0 ? rows : staticServices
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('[packages][GET] error', err)
    return new Response(JSON.stringify(staticServices), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
}
