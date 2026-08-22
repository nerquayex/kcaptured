'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PackageOption {
  id: string
  name: string
}

interface BookingFormProps {
  isOpen: boolean
  initialPackage?: string
  onClose: () => void
  onSaved: () => void
}

export function BookingForm({ isOpen, initialPackage = '', onClose, onSaved }: BookingFormProps) {
  const [packages, setPackages] = useState<PackageOption[]>([])
  const [packageName, setPackageName] = useState(initialPackage)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const submittingRef = useRef(false)
  const requestKeyRef = useRef(crypto.randomUUID())

  useEffect(() => {
    if (!isOpen) return
    setPackageName(initialPackage)
    setSaved(false)
    setSavedMessage('')
    setError('')
    requestKeyRef.current = crypto.randomUUID()
    fetch('/api/packages')
      .then((response) => response.ok ? response.json() : [])
      .then((rows) => setPackages(Array.isArray(rows) ? rows : []))
      .catch(() => setPackages([]))
  }, [initialPackage, isOpen])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const body = {
      clientName: String(form.get('clientName') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim(),
      packageName: packageName.trim(),
      preferredDate: String(form.get('preferredDate') ?? '').trim(),
      notes: String(form.get('notes') ?? '').trim(),
      idempotencyKey: requestKeyRef.current,
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const contentType = response.headers.get('content-type') ?? ''
      const responseText = await response.text()
      let result: { booking?: { id?: string }; alreadyCreated?: boolean; error?: string } = {}

      if (responseText.trim() && contentType.toLowerCase().includes('application/json')) {
        try {
          result = JSON.parse(responseText)
        } catch (parseError) {
          console.error('[booking-form] failed to parse JSON response', {
            status: response.status,
            ok: response.ok,
            contentType,
            body: responseText,
            parseError,
          })
        }
      } else if (responseText.trim()) {
        console.error('[booking-form] received non-JSON booking response', {
          status: response.status,
          ok: response.ok,
          contentType,
          body: responseText,
        })
      }

      console.info('[booking-form] booking response', {
        status: response.status,
        ok: response.ok,
        contentType,
        hasBody: Boolean(responseText.trim()),
        result,
      })

      if (!response.ok) {
        console.error('[booking-form] booking API returned an error', {
          status: response.status,
          body: responseText,
          result,
        })
        return
      }

      if (!result.booking?.id) {
        console.error('[booking-form] successful HTTP response did not include booking.id', {
          status: response.status,
          contentType,
          body: responseText,
          result,
        })
        event.currentTarget.reset()
        setSavedMessage('Your request reached the server, but the confirmation response was incomplete. Please do not submit it again. We will review your request shortly.')
        setSaved(true)
        return
      }

      event.currentTarget.reset()
      setSavedMessage(result.alreadyCreated ? 'Your booking request was already saved. We will review it and get back to you.' : 'Your booking request was saved successfully. We will review it and get back to you.')
      setSaved(true)
    } catch (requestError) {
      console.error('[booking-form] booking request failed before a response was processed', requestError)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
      onSaved()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white/10 bg-black/95 p-6 text-white shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 text-gray-400 transition-colors hover:text-white" aria-label="Close booking form">
          <X size={22} />
        </button>
        <h2 className="mb-2 text-2xl font-bold">Request a booking</h2>
        <p className="mb-6 text-gray-300">Send your details and we will confirm availability.</p>
        {saved ? (
          <div className="space-y-5 text-center">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-200">
              {savedMessage || 'Your booking request was saved successfully. We will review it and get back to you.'}
            </div>
            <Button type="button" onClick={onSaved} className="w-full">Continue to Instagram</Button>
          </div>
        ) : <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="booking-client" className="mb-1 block text-sm font-medium">Name</label>
            <input id="booking-client" name="clientName" required maxLength={120} className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-white/40" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="booking-email" className="mb-1 block text-sm font-medium">Email</label>
              <input id="booking-email" name="email" type="email" maxLength={254} className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-white/40" />
            </div>
            <div>
              <label htmlFor="booking-phone" className="mb-1 block text-sm font-medium">Phone</label>
              <input id="booking-phone" name="phone" type="tel" maxLength={40} className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-white/40" />
            </div>
          </div>
          <div>
            <label htmlFor="booking-package" className="mb-1 block text-sm font-medium">Package</label>
            <select id="booking-package" value={packageName} onChange={(event) => setPackageName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-white/40">
              <option value="" className="bg-black">Select a package</option>
              {packages.map((pkg) => <option key={pkg.id} value={pkg.name} className="bg-black">{pkg.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="booking-date" className="mb-1 block text-sm font-medium">Preferred date</label>
            <input id="booking-date" name="preferredDate" type="date" className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-white/40" />
          </div>
          <div>
            <label htmlFor="booking-notes" className="mb-1 block text-sm font-medium">Message</label>
            <textarea id="booking-notes" name="notes" rows={4} maxLength={2000} className="w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-white/40" />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full">{submitting ? 'Submitting...' : 'Submit booking request'}</Button>
        </form>}
      </div>
    </div>
  )
}
