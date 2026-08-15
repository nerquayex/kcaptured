'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PortfolioImage } from '@/lib/portfolio-data'
import { Button } from '@/components/ui/button'
import { PortfolioManager } from '@/components/portfolio-manager'
import { TestimonialsManager } from '@/components/testimonials-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const AUTH_TOKEN_KEY = 'uploadToken'
const AUTH_TOKEN_EXPIRY_KEY = 'uploadTokenExpiry'
const AUTH_ENTRY_KEY = 'uploadEntryAllowed'

export default function UploadPage() {
  const router = useRouter()

  const [authorized, setAuthorized] = useState(false)
  const [checkedAuth, setCheckedAuth] = useState(false)
  const [uploadMode, setUploadMode] = useState<'portfolio' | 'testimonials'>('portfolio')
  const [images, setImages] = useState<PortfolioImage[]>([])
  const [loadingImages, setLoadingImages] = useState(true)

  useEffect(() => {
    const storedToken = window.sessionStorage.getItem(AUTH_TOKEN_KEY)
    const expiryValue = window.sessionStorage.getItem(AUTH_TOKEN_EXPIRY_KEY)
    const entryAllowed = window.sessionStorage.getItem(AUTH_ENTRY_KEY)
    const expiresAt = expiryValue ? Number(expiryValue) : 0

    if (storedToken && expiresAt > Date.now() && entryAllowed === 'true') {
      setAuthorized(true)
      setCheckedAuth(true)
      return
    }

    window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
    window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
    window.sessionStorage.removeItem(AUTH_ENTRY_KEY)
    setAuthorized(false)
    setCheckedAuth(true)
  }, [])

  useEffect(() => {
    async function loadImages() {
      setLoadingImages(true)
      try {
        const response = await fetch('/api/portfolio-images')
        if (!response.ok) {
          throw new Error('Failed to load portfolio images')
        }
        const data = await response.json()
        setImages(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingImages(false)
      }
    }

    loadImages()
  }, [])

  if (!checkedAuth) {
    return null
  }

  return (
    <div className="min-h-screen bg-black py-16 text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h2 className="text-2xl font-semibold">Legacy Upload Page Retired</h2>
          <p className="mt-4 text-gray-300">The old client upload dashboard has been replaced by a new admin area.</p>
          <div className="mt-6">
            <a href="/admin" className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white">Go to Admin Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  )
}
