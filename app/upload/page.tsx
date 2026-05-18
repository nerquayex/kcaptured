'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const AUTH_TOKEN_KEY = 'uploadToken'
const AUTH_TOKEN_EXPIRY_KEY = 'uploadTokenExpiry'
const AUTH_ENTRY_KEY = 'uploadEntryAllowed'
const UPLOAD_SOURCE_HEADER_VALUE = 'kc-upload'

export default function UploadPage() {
  const router = useRouter()
  const categories = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_UPLOAD_CATEGORIES ??
        'studio,lifestyle,event,portrait')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [],
  )

  const [authorized, setAuthorized] = useState(false)
  const [checkedAuth, setCheckedAuth] = useState(false)
  const [token, setToken] = useState('')
  const [uploadMode, setUploadMode] = useState<'images' | 'testimonial'>('images')
  
  // Image upload state
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState(categories[0] ?? 'studio')
  
  // Testimonial upload state
  const [testimonialVideo, setTestimonialVideo] = useState<File | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientRole, setClientRole] = useState('')
  const [testimonialContent, setTestimonialContent] = useState('')
  
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const storedToken = window.sessionStorage.getItem(AUTH_TOKEN_KEY)
    const expiryValue = window.sessionStorage.getItem(AUTH_TOKEN_EXPIRY_KEY)
    const entryAllowed = window.sessionStorage.getItem(AUTH_ENTRY_KEY)
    const expiresAt = expiryValue ? Number(expiryValue) : 0

    if (storedToken && expiresAt > Date.now() && entryAllowed === 'true') {
      setToken(storedToken)
      setAuthorized(true)
      setCheckedAuth(true)
      return
    }

    window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
    window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
    window.sessionStorage.removeItem(AUTH_ENTRY_KEY)
    setAuthorized(false)
    setCheckedAuth(true)
    router.replace('/')
  }, [router])

  useEffect(() => {
    // Keep the upload token in session storage across refreshes.
    // This allows the user to stay authorized while the token remains valid.
  }, [])

  const handleUpload = async () => {
    if (uploadMode === 'images') {
      if (!file || !token) {
        setError('Select an image and category before uploading.')
        return
      }

      setError('')
      setSuccessMessage('')
      setUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'x-upload-source': UPLOAD_SOURCE_HEADER_VALUE,
          },
          body: formData,
        })

        const body = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
            window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
            router.replace('/')
            return
          }

          setError(body?.error ?? 'Upload failed. Please try again.')
          return
        }

        setSuccessMessage('Upload completed successfully. Redirecting home...')
        setFile(null)
        setTimeout(() => {
          window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
          window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
          router.push('/')
        }, 1500)
      } catch {
        setError('Upload failed. Please try again.')
      } finally {
        setUploading(false)
      }
    } else {
      // Testimonial upload
      if (!testimonialVideo || !clientName || !clientRole || !testimonialContent || !token) {
        setError('Please fill in all testimonial fields.')
        return
      }

      setError('')
      setSuccessMessage('')
      setUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', testimonialVideo)
        formData.append('clientName', clientName)
        formData.append('clientRole', clientRole)
        formData.append('content', testimonialContent)

        const response = await fetch('/api/testimonial-upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'x-upload-source': UPLOAD_SOURCE_HEADER_VALUE,
          },
          body: formData,
        })

        const body = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
            window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
            router.replace('/')
            return
          }

          setError(body?.error ?? 'Testimonial upload failed. Please try again.')
          return
        }

        setSuccessMessage('Testimonial uploaded successfully! Redirecting home...')
        setTestimonialVideo(null)
        setClientName('')
        setClientRole('')
        setTestimonialContent('')
        setTimeout(() => {
          window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
          window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
          router.push('/')
        }, 1500)
      } catch {
        setError('Testimonial upload failed. Please try again.')
      } finally {
        setUploading(false)
      }
    }
  }

  if (!checkedAuth) {
    return null
  }

  return (
    <div className="min-h-screen bg-black py-16 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 sm:p-10">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">Client upload</p>
          <h1 className="text-4xl font-semibold">Upload new images</h1>
          <p className="mx-auto max-w-2xl text-gray-300">
            Use the upload key from the footer to get one active upload session. Your access is valid for 5 minutes.
          </p>
        </div>

        {authorized ? (
          <Tabs value={uploadMode} onValueChange={(value) => setUploadMode(value as 'images' | 'testimonial')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="images">Upload Images</TabsTrigger>
              <TabsTrigger value="testimonial">Add Testimonial</TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">Image file</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">Category</label>
                  <Select value={category} onValueChange={(value) => setCategory(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              {successMessage && <p className="text-sm text-green-400">{successMessage}</p>}

              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
                    window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
                    router.replace('/')
                  }}
                >
                  Exit
                </Button>
                <Button size="sm" onClick={handleUpload} disabled={!file || uploading} className="flex-1">
                  {uploading ? 'Uploading...' : 'Upload image'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="testimonial" className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">Testimonial Video</label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(event) => setTestimonialVideo(event.target.files?.[0] ?? null)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">Client Name</label>
                  <Input
                    type="text"
                    placeholder="e.g., John Doe"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">Client Role/Session Type</label>
                  <Input
                    type="text"
                    placeholder="e.g., Studio Session"
                    value={clientRole}
                    onChange={(e) => setClientRole(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">Testimonial Content</label>
                  <textarea
                    className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="What did the client say about the experience?"
                    rows={4}
                    value={testimonialContent}
                    onChange={(e) => setTestimonialContent(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              {successMessage && <p className="text-sm text-green-400">{successMessage}</p>}

              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
                    window.sessionStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
                    router.replace('/')
                  }}
                >
                  Exit
                </Button>
                <Button size="sm" onClick={handleUpload} disabled={!testimonialVideo || !clientName || !clientRole || !testimonialContent || uploading} className="flex-1">
                  {uploading ? 'Uploading...' : 'Submit testimonial'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-red-500/10 p-8 text-center text-red-200">
            <p className="text-lg font-semibold">Upload access expired.</p>
            <p className="mt-2 text-sm text-gray-300">
              Use the footer padlock again to request a new 5-minute upload session.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
