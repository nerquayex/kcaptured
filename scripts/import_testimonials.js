const fs = require('fs')
const path = require('path')
const { Pool } = require('@neondatabase/serverless')

function loadEnv() {
  const file = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    let value = trimmed.slice(separator + 1)
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    process.env[trimmed.slice(0, separator)] = value
  }
}

loadEnv()
const source = [
  { id: '1', clientName: '@johndoe', clientRole: 'Lifestyle Session', content: 'The photos are absolutely stunning! Perfect captures of our special moments.', videoUrl: 'https://res.cloudinary.com/dq4tkpuu4/video/upload/v1773351713/IMG_4097_wpvm2t.mov', imageUrl: 'https://via.placeholder.com/100x100' },
  { id: '2', clientName: '@jane smith', clientRole: 'Studio Session', content: 'Amazing headshots! The quality and professionalism exceeded expectations.', videoUrl: 'https://res.cloudinary.com/dq4tkpuu4/video/upload/v1773351707/IMG_1792_vankcs.mov', imageUrl: 'https://via.placeholder.com/100x100' },
  { id: '3', clientName: '@john doe', clientRole: 'Brand Shoot', content: 'Fantastic work! The photographer really understood our vision and delivered brilliantly.', videoUrl: 'https://res.cloudinary.com/dq4tkpuu4/video/upload/v1773351706/FAC3213C-DDD1-465F-A2D3-713549EC094E_n5hscs.mov', imageUrl: 'https://via.placeholder.com/100x100' },
]
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

;(async () => {
  try {
    for (const item of source) {
      await pool.query(
        `INSERT INTO testimonials (id, client_name, client_role, content, video_url, image_url, rating, published, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,5,true,now(),now()) ON CONFLICT (id) DO NOTHING`,
        [item.id, item.clientName, item.clientRole, item.content, item.videoUrl, item.imageUrl],
      )
    }
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM testimonials')
    console.log('testimonials count:', result.rows[0].count)
  } finally {
    await pool.end()
  }
})().catch((error) => {
  console.error('testimonial import failed:', error.message)
  process.exit(1)
})
