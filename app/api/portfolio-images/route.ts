import db, { pool } from '@/lib/db'
import { portfolioItems } from '@/db/schema'

export const runtime = 'nodejs'
import { portfolioImages, eventSamples } from '@/lib/portfolio-data'

export async function GET() {
  try {
    // Use persisted portfolio items as the source of truth
    const res = await pool.query('SELECT * FROM portfolio_items WHERE active = true ORDER BY sort_order ASC')
    const rows = res?.rows ?? []

    const managed = rows.map((r: any) => ({
      id: r.id,
      cloudinaryUrl: r.cloudinary_url,
      publicId: r.public_id,
      category: r.category,
      title: r.title,
      description: r.caption ?? undefined,
      width: r.width ?? 1200,
      height: r.height ?? 800,
      sort_order: r.sort_order,
      featured: r.featured,
      active: r.active,
      created_at: r.created_at,
    }))

    // Append curated static images as fallback (static curated images from `lib/portfolio-data`)
    const fallback = [...portfolioImages, ...eventSamples]

    // Deduplicate: remove fallback items that already exist in managed (by publicId or cloudinaryUrl)
    const managedPublicIds = new Set(managed.map((m: any) => String(m.publicId ?? '').trim()).filter(Boolean))
    const managedUrls = new Set(managed.map((m: any) => String(m.cloudinaryUrl ?? '').trim()).filter(Boolean))

    function derivePublicIdFromUrl(url: string) {
      try {
        let u = String(url)
        const idx = u.indexOf('/upload/')
        if (idx !== -1) u = u.slice(idx + '/upload/'.length)
        u = u.replace(/^.*?v\d+\//, '')
        u = u.split('?')[0].replace(/\.[a-zA-Z0-9]+$/, '')
        return u
      } catch (e) {
        return ''
      }
    }

    const fallbackFiltered = fallback.filter((f) => {
      const fUrl = String(f.cloudinaryUrl ?? '').trim()
      if (!fUrl) return false
      if (managedUrls.has(fUrl)) return false
      const fPublicId = String((f as any).publicId ?? derivePublicIdFromUrl(fUrl)).trim()
      if (fPublicId && managedPublicIds.has(fPublicId)) return false
      return true
    })

    const images = [...managed, ...fallbackFiltered]

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
