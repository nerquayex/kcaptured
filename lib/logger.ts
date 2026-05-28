import { promises as fs } from 'fs'
import path from 'path'

export type UploadLogType =
  | 'key_failed'
  | 'key_success'
  | 'upload_attempt'
  | 'upload_success'
  | 'upload_error'
  | 'upload_delete'

export interface UploadLogEntry {
  timestamp: string
  type: UploadLogType
  category?: string
  fileName?: string
  fileSize?: number
  fileMimeType?: string
  publicId?: string
  url?: string
  error?: string
  uploadSource?: string
  userAgent?: string
  ip?: string
}

const LOGS_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOGS_DIR, 'uploads.json')
const MAX_ENTRIES = 10000

export async function appendUploadLog(entry: Omit<UploadLogEntry, 'timestamp'>) {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true })

    let logs: UploadLogEntry[] = []
    try {
      const raw = await fs.readFile(LOG_FILE, 'utf8')
      logs = JSON.parse(raw) as UploadLogEntry[]
    } catch {
      logs = []
    }

    logs.push({
      ...entry,
      timestamp: new Date().toISOString(),
    })

    if (logs.length > MAX_ENTRIES) {
      logs = logs.slice(-MAX_ENTRIES)
    }

    await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8')
  } catch (error) {
    console.error('[upload-logger] writing failed', error)
  }
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  return 'unknown'
}
