import { pool } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get('category')
    const params: string[] = []
    const categoryClause = category ? ' AND category = $1' : ''
    if (category) params.push(category)
    const res = await pool.query(`SELECT * FROM portfolio_items WHERE active = true${categoryClause} ORDER BY sort_order ASC`, params)
    const rows = res?.rows ?? []

    const images = rows.map((r: any) => ({
      id: r.id,
      cloudinaryUrl: r.cloudinary_url,
      publicId: r.public_id,
      category: r.category,
      title: r.title,
      caption: r.caption ?? undefined,
      width: r.width ?? 1200,
      height: r.height ?? 800,
      sort_order: r.sort_order,
      featured: r.featured,
      active: r.active,
      created_at: r.created_at,
    }))

    return new Response(JSON.stringify(images), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Failed to load portfolio images:', error)
    return new Response(JSON.stringify({ error: 'Failed to load portfolio images' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
