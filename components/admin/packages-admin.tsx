'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface PackageItem {
  id: string
  category: string
  name: string
  duration?: string
  price?: number
  features?: string[]
  sampleUrl?: string | null
  sortOrder?: number
  active?: boolean
}

export function PackagesAdmin() {
  const [items, setItems] = useState<PackageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  // Add form
  const [addOpen, setAddOpen] = useState(false)
  const [addId, setAddId] = useState('')
  const [addName, setAddName] = useState('')
  const [addCategory, setAddCategory] = useState('lifestyle')
  const [addDuration, setAddDuration] = useState('')
  const [addPrice, setAddPrice] = useState('0')
  const [addFeatures, setAddFeatures] = useState('')
  const [addSampleUrl, setAddSampleUrl] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<PackageItem | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    setLoading(true)
    try {
      const res = await fetch('/api/packages')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load packages', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    setSaving(true)
    try {
      const token = window.sessionStorage.getItem('uploadToken') ?? ''
      if (!token) { alert('Missing upload token'); return }
      const payload = {
        id: addId || String(Date.now()),
        category: addCategory,
        name: addName,
        duration: addDuration,
        price: Number(addPrice) || 0,
        features: addFeatures.split('\n').map((s) => s.trim()).filter(Boolean),
        sampleUrl: addSampleUrl || null,
      }
      const res = await fetch('/api/package', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-upload-source': 'kc-upload' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Create failed')
      const body = await res.json()
      const added = body?.item
      if (added) setItems((prev) => [added, ...prev])
      setAddOpen(false)
      setAddId('')
      setAddName('')
      setAddFeatures('')
    } catch (e) {
      console.error(e)
      alert('Create failed')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(it: PackageItem) {
    setEditItem(it)
    setEditOpen(true)
  }

  async function saveEdit() {
    if (!editItem) return
    setSavingEdit(true)
    try {
      const token = window.sessionStorage.getItem('uploadToken') ?? ''
      if (!token) { alert('Missing token'); return }
      const payload = { id: editItem.id, category: editItem.category, name: editItem.name, duration: editItem.duration, price: editItem.price, features: editItem.features, sampleUrl: editItem.sampleUrl, active: editItem.active }
      const res = await fetch('/api/package', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-upload-source': 'kc-upload' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Save failed')
      const body = await res.json()
      const updated = body?.item
      if (updated) setItems((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
      setEditOpen(false)
      setEditItem(null)
    } catch (e) {
      console.error(e)
      alert('Save failed')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete(it: PackageItem) {
    if (!confirm('Delete this package?')) return
    try {
      const token = window.sessionStorage.getItem('uploadToken') ?? ''
      if (!token) { alert('Missing token'); return }
      const res = await fetch('/api/package-delete', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-upload-source': 'kc-upload' }, body: JSON.stringify({ id: it.id }) })
      if (!res.ok) throw new Error('Delete failed')
      setItems((prev) => prev.filter((p) => p.id !== it.id))
    } catch (e) {
      console.error(e)
      alert('Delete failed')
    }
  }

  async function move(index: number, delta: number) {
    const list = items.slice()
    const to = index + delta
    if (to < 0 || to >= list.length) return
    const [item] = list.splice(index, 1)
    list.splice(to, 0, item)
    setItems(list)
    try {
      const token = window.sessionStorage.getItem('uploadToken') ?? ''
      const ids = list.map((i) => i.id)
      await fetch('/api/package-reorder', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-upload-source': 'kc-upload' }, body: JSON.stringify({ ids }) })
    } catch (e) {
      console.error('Reorder failed', e)
    }
  }

  const filtered = filter ? items.filter((i) => i.category === filter) : items

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Packages Manager</h2>
          <p className="text-sm text-gray-400">Manage service packages persisted in the database.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md bg-gray-900 px-3 py-2">
            <option value="">All categories</option>
            <option value="lifestyle">lifestyle</option>
            <option value="studio">studio</option>
            <option value="event">event</option>
            <option value="graduation">graduation</option>
          </select>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Add package</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add package</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div>
                  <label className="block text-sm">ID (unique)</label>
                  <Input value={addId} onChange={(e) => setAddId(e.target.value)} placeholder="optional - will be autogenerated" />
                </div>
                <div>
                  <label className="block text-sm">Name</label>
                  <Input value={addName} onChange={(e) => setAddName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm">Category</label>
                  <select value={addCategory} onChange={(e) => setAddCategory(e.target.value)} className="rounded-md bg-gray-900 px-3 py-2 w-full">
                    <option value="lifestyle">lifestyle</option>
                    <option value="studio">studio</option>
                    <option value="event">event</option>
                    <option value="graduation">graduation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Duration</label>
                  <Input value={addDuration} onChange={(e) => setAddDuration(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm">Price</label>
                  <Input value={addPrice} onChange={(e) => setAddPrice(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm">Features (one per line)</label>
                  <textarea value={addFeatures} onChange={(e) => setAddFeatures(e.target.value)} className="w-full rounded-md bg-gray-900 p-2" rows={6} />
                </div>
                <div>
                  <label className="block text-sm">Sample image URL</label>
                  <Input value={addSampleUrl} onChange={(e) => setAddSampleUrl(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Add'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="rounded-md border p-6">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border p-6">No packages</div>
        ) : (
          filtered.map((it, idx) => (
            <div key={it.id} className="rounded-md border bg-white/5 p-4 flex gap-4 items-center">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{it.name}</h3>
                      <span className="text-xs text-green-300">DB</span>
                    </div>
                    <div className="text-sm text-gray-400">{it.category} • ${it.price} • {it.duration}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => move(idx, -1)}>↑</Button>
                    <Button size="sm" onClick={() => move(idx, 1)}>↓</Button>
                    <Button size="sm" onClick={() => openEdit(it)}>Edit</Button>
                    <Button size="sm" onClick={() => handleDelete(it)}>Delete</Button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-300">{(it.features || []).join(' • ')}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit package</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <label className="block text-sm">Name</label>
              <Input value={editItem?.name ?? ''} onChange={(e) => setEditItem(editItem ? { ...editItem, name: e.target.value } : editItem)} />
            </div>
            <div>
              <label className="block text-sm">Category</label>
              <select value={editItem?.category ?? ''} onChange={(e) => setEditItem(editItem ? { ...editItem, category: e.target.value } : editItem)} className="rounded-md bg-gray-900 px-3 py-2 w-full">
                <option value="lifestyle">lifestyle</option>
                <option value="studio">studio</option>
                <option value="event">event</option>
                <option value="graduation">graduation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Duration</label>
              <Input value={editItem?.duration ?? ''} onChange={(e) => setEditItem(editItem ? { ...editItem, duration: e.target.value } : editItem)} />
            </div>
            <div>
              <label className="block text-sm">Price</label>
              <Input value={String(editItem?.price ?? 0)} onChange={(e) => setEditItem(editItem ? { ...editItem, price: Number(e.target.value) || 0 } : editItem)} />
            </div>
            <div>
              <label className="block text-sm">Features (one per line)</label>
              <textarea value={(editItem?.features || []).join('\n')} onChange={(e) => setEditItem(editItem ? { ...editItem, features: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) } : editItem)} className="w-full rounded-md bg-gray-900 p-2" rows={6} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={!!editItem?.active} onChange={(e) => setEditItem(editItem ? { ...editItem, active: e.target.checked } : editItem)} />
              <span className="text-sm">Active</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setEditOpen(false); setEditItem(null) }}>Cancel</Button>
            <Button size="sm" onClick={saveEdit} disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
