type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function getClientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: windowMs }
  }

  existing.count += 1
  return {
    allowed: existing.count <= limit,
    retryAfter: Math.max(0, existing.resetAt - now),
  }
}
