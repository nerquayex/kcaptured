import { randomUUID } from 'crypto'
import { pool } from '@/lib/db'
import { verifyUploadToken } from '@/lib/auth-utils'

export const runtime = 'nodejs'

function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }) }
function isAdmin(request: Request) {
  const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  return Boolean(token && request.headers.get('x-upload-source') === 'kc-upload' && verifyUploadToken(token))
}
function mapRow(row: any) {
  const type = row.action === 'created' ? 'create' : row.action === 'deleted' ? 'delete' : row.action === 'status_changed' ? 'status' : row.action === 'settings_updated' ? 'settings' : row.action === 'login' ? 'login' : row.action === 'logout' ? 'logout' : 'edit'
  return { id: row.id, datetime: String(row.created_at), activity: row.action, description: row.description, section: row.entity_type, type, entityId: row.entity_id }
}

export async function GET(request: Request) {
  if (!isAdmin(request)) return json({ error: 'Unauthorized' }, 401)
  try { const result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC'); return json(result.rows.map(mapRow)) }
  catch (error) { console.error('[audit][GET] error', error); return json({ error: 'Failed to load audit trail' }, 500) }
}

export async function POST(request: Request) {
  if (!isAdmin(request)) return json({ error: 'Unauthorized' }, 401)
  try {
    const body = await request.json()
    if (!body.action || !body.entityType || !body.description) return json({ error: 'Audit action, entity type, and description are required' }, 400)
    const result = await pool.query('INSERT INTO audit_logs (id, action, entity_type, entity_id, description, actor, created_at) VALUES ($1,$2,$3,$4,$5,$6,now()) RETURNING *', [randomUUID(), String(body.action), String(body.entityType), body.entityId ? String(body.entityId) : null, String(body.description), 'admin'])
    return json(mapRow(result.rows[0]), 201)
  } catch (error) { console.error('[audit][POST] error', error); return json({ error: 'Failed to write audit record' }, 500) }
}
