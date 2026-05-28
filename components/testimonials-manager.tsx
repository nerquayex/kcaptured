'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const AUTH_TOKEN_KEY = 'uploadToken'
const UPLOAD_SOURCE_HEADER_VALUE = 'kc-upload'

interface TestimonialData {
  id: string
  clientName: string
  clientRole: string
  content: string
  videoUrl: string
  createdAt: string
}

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientRole, setClientRole] = useState('')
  const [testimonialContent, setTestimonialContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/testimonials')
      const data = await response.json()
      if (Array.isArray(data)) {
        setTestimonials(data)
      }
    } catch (fetchError) {
      console.error('Failed to fetch testimonials', fetchError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleUpload = async () => {
    setError('')
    setSuccess('')

    const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? ''

    if (!videoFile || !clientName || !clientRole || !testimonialContent) {
      setError('Please fill in every testimonial field and attach a video.')
      return
    }

    if (!token) {
      setError('Upload key missing. Use the footer lock to request a session.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', videoFile)
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
          window.sessionStorage.removeItem('uploadTokenExpiry')
          window.location.reload()
          return
        }

        setError(body?.error ?? 'Testimonial upload failed. Please try again.')
        return
      }

      setSuccess('Testimonial added successfully. Refreshing list...')
      setVideoFile(null)
      setClientName('')
      setClientRole('')
      setTestimonialContent('')
      setTimeout(() => {
        setDialogOpen(false)
        fetchTestimonials()
      }, 900)
    } catch (uploadError) {
      console.error(uploadError)
      setError('Testimonial upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary">Testimonials</p>
            <h1 className="mt-3 text-4xl font-semibold">Client testimonials</h1>
            <p className="mt-3 max-w-2xl text-gray-300">
              See what clients are saying and add new testimonial videos with text metadata.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Add new</Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border border-white/10 p-6 shadow-2xl">
              <DialogHeader>
                <DialogTitle>Add testimonial</DialogTitle>
                <DialogDescription>
                  Upload a client testimonial video and add the name, session type, and text.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">Testimonial video</label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">Client name</label>
                  <Input
                    type="text"
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="e.g. Jordan Smith"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">Client role / session type</label>
                  <Input
                    type="text"
                    value={clientRole}
                    onChange={(event) => setClientRole(event.target.value)}
                    placeholder="e.g. Lifestyle Session"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">Testimonial text</label>
                  <Textarea
                    value={testimonialContent}
                    onChange={(event) => setTestimonialContent(event.target.value)}
                    placeholder="What did the client say about the shoot?"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}
                {success && <p className="text-sm text-green-400">{success}</p>}
              </div>

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Submit testimonial'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-300">
              Loading testimonials...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-300">
              No testimonials yet. Add a new one to get started.
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm"
              >
                {testimonial.videoUrl && (
                  <div className="mb-4 overflow-hidden rounded-2xl bg-black">
                    <video
                      src={testimonial.videoUrl}
                      controls
                      className="w-full h-auto"
                    />
                  </div>
                )}
                <p className="text-lg text-gray-200 italic mb-4">"{testimonial.content}"</p>
                <div className="space-y-1">
                  <p className="font-semibold text-white">{testimonial.clientName}</p>
                  <p className="text-sm text-gray-400">{testimonial.clientRole}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
