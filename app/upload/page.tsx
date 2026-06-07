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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 sm:p-10">
          <div className="mb-8 space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-primary">Client upload</p>
            <h1 className="text-4xl font-semibold">Upload dashboard</h1>
            <p className="mx-auto max-w-2xl text-gray-300">
              Use the footer upload key to manage portfolio images and testimonials from one place.
            </p>
          </div>

          {authorized ? (
            <Tabs value={uploadMode} onValueChange={(value) => setUploadMode(value as 'portfolio' | 'testimonials')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 gap-2">
                <TabsTrigger value="portfolio">Portfolio images</TabsTrigger>
                <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="space-y-6">
                {loadingImages ? (
                  <div className="rounded-3xl border border-white/10 bg-black/70 p-8 text-center text-gray-300">
                    Loading portfolio images...
                  </div>
                ) : (
                  <PortfolioManager images={images} />
                )}
              </TabsContent>

              <TabsContent value="testimonials" className="space-y-6">
                <TestimonialsManager />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-red-500/10 p-8 text-center text-red-200">
              <p className="text-lg font-semibold">Upload access expired.</p>
              <p className="mt-2 text-sm text-gray-300">
                Use the footer padlock again to request a new 10-minute upload session.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
