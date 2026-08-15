'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { services } from '@/lib/services-data'

const AUTH_TOKEN_KEY = 'uploadToken'
const AUTH_TOKEN_EXPIRY_KEY = 'uploadTokenExpiry'
const AUTH_ENTRY_KEY = 'uploadEntryAllowed'

export default function AdminPage() {
  const [checkedAuth, setCheckedAuth] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [portfolioCount, setPortfolioCount] = useState<number | null>(null)
  const [testimonialCount, setTestimonialCount] = useState<number | null>(null)

  useEffect(() => {
    const storedToken = window.sessionStorage.getItem(AUTH_TOKEN_KEY)
    const expiryValue = window.sessionStorage.getItem(AUTH_TOKEN_EXPIRY_KEY)
    const entryAllowed = window.sessionStorage.getItem(AUTH_ENTRY_KEY)
    const expiresAt = expiryValue ? Number(expiryValue) : 0

    if (storedToken && expiresAt > Date.now() && entryAllowed === 'true') {
      setAuthorized(true)
    } else {
      setAuthorized(false)
    }
    setCheckedAuth(true)
  }, [])

  useEffect(() => {
    async function loadCounts() {
      try {
        const p = await fetch('/api/portfolio-images')
        const pi = await p.ok ? await p.json() : []
        setPortfolioCount(Array.isArray(pi) ? pi.length : 0)
      } catch (e) {
        setPortfolioCount(0)
      }

      try {
        const t = await fetch('/api/testimonials')
        const ti = await t.ok ? await t.json() : []
        setTestimonialCount(Array.isArray(ti) ? ti.length : 0)
      } catch (e) {
        setTestimonialCount(0)
      }
    }
    loadCounts()
  }, [])

  if (!checkedAuth) return null

  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold">Administration Dashboard</h1>
          <p className="mt-2 text-gray-300">Manage portfolio, packages, testimonials, bookings and site settings.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-gray-300">Portfolio Images</p>
            <div className="mt-2 text-2xl font-semibold">{portfolioCount ?? '—'}</div>
            <div className="mt-4">
              <Link href="/admin/portfolio"><Button size="sm">Manage</Button></Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-gray-300">Packages</p>
            <div className="mt-2 text-2xl font-semibold">{services.length}</div>
            <div className="mt-4">
              <Link href="/admin/packages"><Button size="sm">Manage</Button></Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-gray-300">Testimonials</p>
            <div className="mt-2 text-2xl font-semibold">{testimonialCount ?? '—'}</div>
            <div className="mt-4">
              <Link href="/admin/testimonials"><Button size="sm">Manage</Button></Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-gray-300">Bookings</p>
            <div className="mt-2 text-2xl font-semibold">0</div>
            <div className="mt-4">
              <Link href="/admin/bookings"><Button size="sm">Manage</Button></Link>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <nav className="flex gap-3">
            <Link href="/admin/portfolio" className="text-sm text-gray-300">Portfolio</Link>
            <Link href="/admin/packages" className="text-sm text-gray-300">Packages</Link>
            <Link href="/admin/testimonials" className="text-sm text-gray-300">Testimonials</Link>
            <Link href="/admin/bookings" className="text-sm text-gray-300">Bookings</Link>
            <Link href="/admin/settings" className="text-sm text-gray-300">Settings</Link>
          </nav>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-400">To access admin features, use the existing upload key padlock in the footer to obtain a session token.</p>
        </div>
      </div>
    </div>
  )
}
