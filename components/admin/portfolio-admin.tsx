'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Image from 'next/image'
import { portfolioImages } from '@/lib/portfolio-data'

interface Item {
  id: string
  publicId?: string
  cloudinaryUrl: string
  category: string
  title?: string
  description?: string
  caption?: string
  width?: number
  height?: number
  featured?: boolean
  active?: boolean
}

export function PortfolioAdmin() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [filter, setFilter] = useState<string>('')

  // Upload form state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState('uncategorized')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploadFeatured, setUploadFeatured] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Edit state
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    // Authoritative categories come from lib/portfolio-data.ts
    try {
      const cats = Array.from(new Set(portfolioImages.map((p) => p.category).filter(Boolean)))
      setCategories(cats)
    } catch (e) {
      // fallback to deriving from items
      const cats = Array.from(new Set((items as any[]).map((i: any) => i.category).filter(Boolean)))
      setCategories(cats)
    }
  }, [])

  useEffect(() => {
    if (categories.length > 0 && (!uploadCategory || uploadCategory === 'uncategorized')) {
      setUploadCategory(categories[0])
    }
  }, [categories])

  async function loadItems() {
    setLoading(true)
    try {
      const res = await fetch('/api/portfolio-images')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
      const cats = Array.from(new Set((Array.isArray(data) ? data : []).map((i: any) => i.category).filter(Boolean)))
      setCategories(cats)
    } catch (e) {
      console.error('Failed to load items', e)
    } finally {
      setLoading(false)
    }
  }

  function isFallback(it: Item) {
    // fallback items from lib/portfolio-data.ts typically have ids like 'event-1' and no publicId
    return !it.publicId || String(it.id).startsWith('event-') || String(it.id).startsWith('lifestyle-') || String(it.id).startsWith('graduation-')
  }

  // Upload handler
  async function handleUpload() {
    setError('')
    if (!file) { setError('Please choose a file'); return }
    const token = window.sessionStorage.getItem('uploadToken') ?? ''
    if (!token) { setError('Missing upload token'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', uploadCategory)
      fd.append('title', uploadTitle || (file as any).name)
      fd.append('caption', uploadCaption)
      fd.append('featured', uploadFeatured ? 'true' : 'false')

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-upload-source': 'kc-upload',
        },
        body: fd,
      })

      const text = await res.text()
      let body = {}
      try { body = text ? JSON.parse(text) : {} } catch { body = {} }

      if (!res.ok) {
        setError((body as any)?.error ?? 'Upload failed')
        return
      }

      const added = (body as any)?.item
      if (added) {
        setItems((prev) => [added, ...prev])
      }
      setDialogOpen(false)
      setFile(null)
      setUploadTitle('')
      setUploadCaption('')
    } catch (e) {
      console.error(e)
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Delete
  async function handleDelete(it: Item) {
    if (!confirm('Delete this image?')) return
    const token = window.sessionStorage.getItem('uploadToken') ?? ''
    if (!token) { alert('Missing token'); return }
    try {
      const res = await fetch('/api/portfolio-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-upload-source': 'kc-upload' },
        body: JSON.stringify({ id: it.id, publicId: (it as any).publicId }),
      })
      if (!res.ok) throw new Error('Delete failed')
      setItems((prev) => prev.filter((p) => p.id !== it.id))
    } catch (e) {
      console.error(e)
      alert('Delete failed')
    }
  }

  // Open edit
  function openEdit(it: Item) {
    if (isFallback(it)) return
    setEditItem(it)
    setEditOpen(true)
  }

  // Save metadata
  async function saveMetadata() {
    if (!editItem) return
    const token = window.sessionStorage.getItem('uploadToken') ?? ''
    if (!token) { alert('Missing token'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/portfolio-item', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-upload-source': 'kc-upload' },
        body: JSON.stringify({ id: editItem.id, title: editItem.title, caption: editItem.caption, category: editItem.category, featured: editItem.featured, active: editItem.active }),
      })
      if (!res.ok) throw new Error('Save failed')
      const body = await res.json()
      const updated = body?.item
      if (updated) {
        setItems((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
      }
      setEditOpen(false)
      setEditItem(null)
    } catch (e) {
      console.error(e)
      alert('Save failed')
    } finally {
      setSaving(false)
    }
  }

  // Reorder (simple up/down)
  async function move(index: number, delta: number) {
    const list = items.slice()
    const to = index + delta
    if (to < 0 || to >= list.length) return
    const [item] = list.splice(index, 1)
    list.splice(to, 0, item)
    setItems(list)
    // send reorder for DB-managed ids only (preserve full array ordering but API expects ids array)
    const token = window.sessionStorage.getItem('uploadToken') ?? ''
    try {
      const ids = list.filter((i) => !isFallback(i)).map((i) => i.id)
      await fetch('/api/portfolio-reorder', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-upload-source': 'kc-upload' }, body: JSON.stringify({ ids }) })
    } catch (e) {
      console.error('Reorder failed', e)
    }
  }

  const filtered = filter ? items.filter((i) => i.category === filter) : items

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Portfolio Manager</h2>
          <p className="text-sm text-gray-400">Manage portfolio images stored in Cloudinary and persisted in the database.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md bg-gray-900 px-3 py-2">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Add new</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add portfolio image</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div>
                  <label className="block text-sm">Image</label>
                  <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </div>
                <div>
                  <label className="block text-sm">Category</label>
                  <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="rounded-md bg-gray-900 px-3 py-2 w-full">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Title</label>
                  <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm">Caption</label>
                  <Input value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={uploadFeatured} onChange={(e) => setUploadFeatured(e.target.checked)} />
                  <span className="text-sm">Featured</span>
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="rounded-md border p-6">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border p-6">No images</div>
        ) : (
          filtered.map((it, idx) => (
            <div key={it.id} className="rounded-md border bg-white/5 p-4 flex gap-4 items-center">
              <div className="w-48 h-32 relative overflow-hidden rounded-md bg-gray-800">
                <Image src={it.cloudinaryUrl} alt={it.title ?? ''} fill sizes="200px" className="object-cover" unoptimized />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{it.title ?? 'Untitled'}</h3>
                      {isFallback(it) ? <span className="text-xs text-yellow-300">Fallback</span> : <span className="text-xs text-green-300">DB</span>}
                    </div>
                    <div className="text-sm text-gray-400">{it.category} {it.featured ? ' • Featured' : ''} {it.active === false ? ' • Hidden' : ''}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => move(idx, -1)}>↑</Button>
                    <Button size="sm" onClick={() => move(idx, 1)}>↓</Button>
                    <Button size="sm" onClick={() => openEdit(it)} disabled={isFallback(it)}>Edit</Button>
                    <Button size="sm" onClick={() => handleDelete(it)} disabled={isFallback(it)}>Delete</Button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-300">{it.caption ?? it.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit item</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <label className="block text-sm">Title</label>
              <Input value={editItem?.title ?? ''} onChange={(e) => setEditItem(editItem ? { ...editItem, title: e.target.value } : editItem)} />
            </div>
            <div>
              <label className="block text-sm">Caption</label>
              <Input value={(editItem as any)?.caption ?? ''} onChange={(e) => setEditItem(editItem ? { ...editItem, caption: e.target.value } : editItem)} />
            </div>
            <div>
              <label className="block text-sm">Category</label>
              <select value={editItem?.category ?? ''} onChange={(e) => setEditItem(editItem ? { ...editItem, category: e.target.value } : editItem)} className="rounded-md bg-gray-900 px-3 py-2 w-full">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                {editItem && !categories.includes(editItem.category || '') && (
                  <option value={editItem.category || ''}>Unmapped: {editItem.category}</option>
                )}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={!!editItem?.featured} onChange={(e) => setEditItem(editItem ? { ...editItem, featured: e.target.checked } : editItem)} />
              <span className="text-sm">Featured</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={editItem?.active !== false} onChange={(e) => setEditItem(editItem ? { ...editItem, active: e.target.checked } : editItem)} />
              <span className="text-sm">Active</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setEditOpen(false); setEditItem(null) }}>Cancel</Button>
            <Button size="sm" onClick={saveMetadata} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
