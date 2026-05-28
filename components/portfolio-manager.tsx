'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PortfolioImage } from '@/lib/portfolio-data'
import { optimizeCloudinaryUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

const AUTH_TOKEN_KEY = 'uploadToken'
const UPLOAD_SOURCE_HEADER_VALUE = 'kc-upload'

interface PortfolioManagerProps {
  images: PortfolioImage[]
}

export function PortfolioManager({ images }: PortfolioManagerProps) {
  const router = useRouter()
  const [uploadCategory, setUploadCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (images.length > 0) {
      const firstCategory = images.find((image) => image.category !== 'uncategorized')
      setUploadCategory(firstCategory?.category ?? images[0].category)
    }
  }, [images])

  const handleDelete = async (image: PortfolioImage) => {
    const ok = confirm('Are you sure you want to delete this image? This action cannot be undone.')
    if (!ok) return

    const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? ''
    if (!token) {
      alert('Upload key missing. Use the footer lock to request a session.')
      return
    }

    try {
      const response = await fetch('/api/portfolio-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-upload-source': UPLOAD_SOURCE_HEADER_VALUE,
        },
        body: JSON.stringify({ id: image.id, publicId: (image as any).publicId }),
      })

      if (!response.ok) {
        const body = await response.json()
        throw new Error(body?.error ?? 'Delete failed')
      }

      router.refresh()
    } catch (e) {
      console.error('Failed to delete portfolio image', e)
      alert('Failed to delete image. See console for details.')
    }
  }

  const handleUpload = async () => {
    setError('')
    setSuccess('')

    const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? ''

    if (!file) {
      setError('Please choose an image to upload.')
      return
    }

    if (!token) {
      setError('Upload key missing. Use the footer lock to request a session.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', uploadCategory || 'uncategorized')

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
          window.sessionStorage.removeItem('uploadTokenExpiry')
          window.location.reload()
          return
        }

        setError(body?.error ?? 'Upload failed. Please try again.')
        return
      }

      setSuccess('Image uploaded successfully. Refreshing gallery...')
      setFile(null)
      setTimeout(() => {
        setDialogOpen(false)
        router.refresh()
      }, 900)
    } catch (uploadError) {
      console.error(uploadError)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary">Portfolio</p>
            <h1 className="mt-3 text-4xl font-semibold">Portfolio images</h1>
            <p className="mt-3 max-w-2xl text-gray-300">
              Browse the current gallery and add new client images directly from this dashboard.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Add new</Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border border-white/10 p-6 shadow-2xl">
              <DialogHeader>
                <DialogTitle>Add new portfolio image</DialogTitle>
                <div className="text-sm text-gray-400">
                  Upload a new image to the portfolio collection.
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">Image file</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                </div>

                {images.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-100">Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(event) => setUploadCategory(event.target.value)}
                      className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      {Array.from(
                        new Set(images.map((image) => image.category).filter((category) => category !== 'uncategorized')),
                      ).map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {error && <p className="text-sm text-red-400">{error}</p>}
                {success && <p className="text-sm text-green-400">{success}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleUpload} disabled={!file || uploading}>
                  {uploading ? 'Uploading...' : 'Upload image'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="absolute right-3 bottom-3 z-20">
                <button
                  onClick={() => handleDelete(image)}
                  className="cursor-pointer rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  aria-label={`Delete ${image.title}`}
                >
                  Delete
                </button>
              </div>

              <div className="relative h-44 overflow-hidden bg-gray-950">
                <Image
                  src={optimizeCloudinaryUrl(image.cloudinaryUrl)}
                  alt={image.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  unoptimized
                  className="object-cover transition duration-300 hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="font-semibold text-white truncate">{image.title}</p>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                  {image.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
