'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard,
  Image as ImageIcon,
  Package,
  Star,
  Calendar,
  Shield,
  Settings,
  Plus,
  Search,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  GripVertical,
  X,
  Upload,
  Eye,
  EyeOff,
  Clock,
  MessageSquare,
  Aperture,
  ArrowUp,
  ArrowDown,
  Check,
} from 'lucide-react'

type Section = 'dashboard' | 'portfolio' | 'packages' | 'testimonials' | 'bookings' | 'trail' | 'settings'
type BookingStatus = 'Pending' | 'To Confirm' | 'Confirmed'
type AuditType = 'create' | 'edit' | 'delete' | 'login' | 'logout' | 'status' | 'settings'

interface PortfolioImage {
  id: string
  title: string
  category: string
  date?: string
  order: number
  src: string
  description?: string
  featured: boolean
}

interface PackageItem {
  id: string
  category: string
  name: string
  price: number
  description?: string
  duration?: string
  images?: number
  features: string[]
  status: 'active' | 'inactive'
}

interface Testimonial {
  id: string
  client: string
  avatar: string
  text: string
  rating: number
  date: string
  published: boolean
}

interface Booking {
  id: string
  client: string
  email: string
  phone: string
  package: string
  preferredDate: string
  requestDate: string
  status: BookingStatus
}

interface AuditEntry {
  id: number
  datetime: string
  activity: string
  description: string
  section: string
  type: AuditType
  prev?: string
  next?: string
}

const RED = '#E50914'
const MONO = "'JetBrains Mono', monospace"
const CONDENSED = "'Barlow Condensed', sans-serif"
const SANS = "'Outfit', system-ui, sans-serif"

const AUDIT_STYLES: Record<AuditType, { dot: string; text: string; label: string }> = {
  create: { dot: 'bg-emerald-500', text: 'text-emerald-400', label: 'Create' },
  edit: { dot: 'bg-blue-400', text: 'text-blue-400', label: 'Edit' },
  delete: { dot: 'bg-red-500', text: 'text-red-400', label: 'Delete' },
  login: { dot: 'bg-zinc-500', text: 'text-zinc-500', label: 'Login' },
  logout: { dot: 'bg-zinc-500', text: 'text-zinc-500', label: 'Logout' },
  status: { dot: 'bg-amber-400', text: 'text-amber-400', label: 'Status' },
  settings: { dot: 'bg-purple-400', text: 'text-purple-400', label: 'Settings' },
}

const BOOKING_STYLES: Record<BookingStatus, string> = {
  Pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  'To Confirm': 'bg-orange-500/10 text-orange-400 border border-orange-500/25',
  Confirmed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
}

function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#1e1e1e] bg-[#0a0a0a] px-7" >
      <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-white" style={{ fontFamily: CONDENSED, fontSize: '0.8rem', letterSpacing: '0.18em' }}>
        {title}
      </h1>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}

function Btn({ onClick, children, variant = 'default', size = 'sm', className = '', type = 'button' }:{
  onClick?: () => void
  children: React.ReactNode
  variant?: 'default' | 'red' | 'ghost' | 'destructive'
  size?: 'sm' | 'xs'
  className?: string
  type?: 'button' | 'submit'
}) {
  const base = 'inline-flex cursor-pointer select-none items-center gap-1.5 rounded border font-medium transition-all'
  const sizes = { sm: 'px-3.5 py-2 text-sm', xs: 'px-2.5 py-1.5 text-xs' }
  const variants = {
    default: 'border-[#2e2e2e] bg-[#1a1a1a] text-zinc-300 hover:border-zinc-500 hover:text-white',
    red: 'border-transparent text-white hover:opacity-90',
    ghost: 'border-transparent bg-transparent text-zinc-500 hover:text-white',
    destructive: 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      style={variant === 'red' ? { background: RED } : undefined}
    >
      {children}
    </button>
  )
}

function FInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</label>
      <input
        {...props}
        className="rounded border border-[#272727] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-zinc-500"
        style={{ fontFamily: SANS }}
      />
    </div>
  )
}

function FTextarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</label>
      <textarea
        {...props}
        className="resize-none rounded border border-[#272727] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-zinc-500"
        style={{ fontFamily: SANS }}
      />
    </div>
  )
}

function FSelect({ label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</label>
      <select
        {...props}
        className="rounded border border-[#272727] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-zinc-500"
      >
        {children}
      </select>
    </div>
  )
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</span>}
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative h-5 w-10 flex-shrink-0 rounded-full transition-colors"
        style={{ background: value ? RED : '#333' }}
      >
        <span
          className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )
}

function SearchBar({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-52 rounded border border-[#272727] bg-[#0d0d0d] py-2 pl-8 pr-3 text-xs text-white placeholder-zinc-700 outline-none transition-colors focus:border-zinc-500"
      />
    </div>
  )
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

function Modal({ open, onClose, title, children, maxW = '480px' }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxW?: string
}) {
  if (!open) return null

  return (
    <Overlay onClose={onClose}>
      <div className="flex max-h-[90vh] w-[min(90vw,theme(width))] flex-col overflow-hidden rounded border border-[#2a2a2a] bg-[#141414]" style={{ maxWidth: maxW }}>
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[#242424] px-6 py-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white" style={{ fontFamily: CONDENSED }}>{title}</span>
          <button onClick={onClose} className="p-0.5 text-zinc-600 transition-colors hover:text-white">
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </Overlay>
  )
}

function ConfirmModal({ open, onClose, onConfirm, name }: { open: boolean; onClose: () => void; onConfirm: () => void; name: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Deletion" maxW="380px">
      <div className="flex flex-col gap-6">
        <p className="text-sm leading-relaxed text-zinc-400">
          This will permanently delete <span className="font-medium text-white">"{name}"</span>. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="red" onClick={() => { onConfirm(); onClose() }}>Delete</Btn>
        </div>
      </div>
    </Modal>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={11} className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'} />
      ))}
    </div>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hov, setHov] = useState(0)

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button type="button" key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(0)} onClick={() => onChange(i)}>
          <Star size={20} className={(hov || value) >= i ? 'fill-amber-400 text-amber-400' : 'text-zinc-700 hover:text-zinc-500'} />
        </button>
      ))}
    </div>
  )
}

function SectionCard({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded border border-[#222] ${className}`} style={{ background: '#141414' }}>
      {title && (
        <div className="border-b border-[#1e1e1e] px-5 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{title}</span>
        </div>
      )}
      {children}
    </div>
  )
}

const NAV: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'portfolio', label: 'Portfolio', Icon: ImageIcon },
  { id: 'packages', label: 'Packages', Icon: Package },
  { id: 'testimonials', label: 'Testimonials', Icon: MessageSquare },
  { id: 'bookings', label: 'Bookings', Icon: Calendar },
  { id: 'trail', label: 'Trail', Icon: Shield },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

function Sidebar({ active, onNavigate }: { active: Section; onNavigate: (s: Section) => void }) {
  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-[#1a1a1a] bg-[#0d0d0d]">
      <div className="flex items-center gap-3 border-b border-[#1a1a1a] px-5 py-5">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-[#e50914] text-white">
          <Aperture size={13} />
        </div>
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.25em] text-white" style={{ fontFamily: CONDENSED }}>Lens</div>
          <div className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-zinc-700">KCAPTURED Studios</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-5">
        {NAV.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => onNavigate(id)} className="group relative flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm transition-all" style={isActive ? { background: '#1c1c1c' } : undefined}>
              {isActive && <span className="absolute inset-y-1 left-0 w-[2px] rounded-r" style={{ background: RED }} />}
              <Icon size={14} className={isActive ? '' : 'text-zinc-600 transition-colors group-hover:text-zinc-400'} style={isActive ? { color: RED } : undefined} />
              <span className={`font-medium transition-colors ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-[#1a1a1a] px-5 py-4">
        <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">v1.0.0</div>
      </div>
    </aside>
  )
}

function DashboardPage({ portfolio, packages, testimonials, bookings, audit, onNavigate }: {
  portfolio: PortfolioImage[]
  packages: PackageItem[]
  testimonials: Testimonial[]
  bookings: Booking[]
  audit: AuditEntry[]
  onNavigate: (s: Section) => void
}) {
  const stats = [
    { label: 'Portfolio Images', value: portfolio.length, sub: `${portfolio.filter((p) => p.featured).length} featured`, Icon: ImageIcon },
    { label: 'Packages', value: packages.length, sub: `${packages.filter((p) => p.status === 'active').length} active`, Icon: Package },
    { label: 'Testimonials', value: testimonials.length, sub: `${testimonials.filter((t) => t.published).length} published`, Icon: MessageSquare },
    { label: 'Total Bookings', value: bookings.length, sub: 'all time', Icon: Calendar },
    { label: 'Pending', value: bookings.filter((b) => b.status === 'Pending').length, sub: 'awaiting review', Icon: Clock },
    { label: 'Confirmed', value: bookings.filter((b) => b.status === 'Confirmed').length, sub: 'this season', Icon: Check },
  ]

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
            {stats.map(({ label, value, sub, Icon }) => (
              <div key={label} className="flex flex-col gap-3 rounded border border-[#222] bg-[#141414] p-4">
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-500 leading-tight">{label}</span>
                  <Icon size={13} className="mt-0.5 flex-shrink-0 text-zinc-700" />
                </div>
                <div>
                  <div className="text-[2rem] font-bold leading-none text-white" style={{ fontFamily: CONDENSED }}>{value}</div>
                  <div className="mt-1 text-[10px] text-zinc-600">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 280px' }}>
            <SectionCard title="Recent Portfolio">
              <div className="flex gap-3 overflow-x-auto p-4">
                {portfolio.slice(0, 6).map((img) => (
                  <div key={img.id} className="w-36 shrink-0 overflow-hidden rounded border border-[#1e1e1e] bg-[#0d0d0d]">
                    <img src={img.src} alt={img.title} className="h-24 w-full object-cover bg-zinc-900" />
                    <div className="p-2.5">
                      <div className="truncate text-xs font-medium text-white">{img.title}</div>
                      <div className="mt-0.5 text-[10px] text-zinc-600">{img.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Recent Activity">
              <div className="flex flex-col">
                {audit.slice(0, 7).map((entry, i) => {
                  const s = AUDIT_STYLES[entry.type]
                  return (
                    <div key={entry.id} className={`flex items-start gap-3 px-4 py-3 ${i < 6 ? 'border-b border-[#1a1a1a]' : ''}`}>
                      <div className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${s.dot}`} />
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium leading-snug text-white">{entry.activity}</div>
                        <div className="mt-0.5 text-[10px] text-zinc-600" style={{ fontFamily: MONO }}>{entry.datetime.slice(0, 10)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </SectionCard>
          </div>

          <div>
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Quick Actions</div>
            <div className="flex gap-3">
              <Btn variant="red" onClick={() => onNavigate('portfolio')}><Plus size={13} />Add Portfolio Image</Btn>
              <Btn onClick={() => onNavigate('packages')}><Plus size={13} />Add Package</Btn>
              <Btn onClick={() => onNavigate('testimonials')}><Plus size={13} />Add Testimonial</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const emptyImgForm = () => ({ title: '', category: 'Lifestyle', date: '', description: '', featured: false })

function PortfolioPage({ portfolio, setPortfolio, addAudit }: {
  portfolio: PortfolioImage[]
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioImage[]>>
  addAudit: (e: Omit<AuditEntry, 'id' | 'datetime'>) => void
}) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<PortfolioImage | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deleting, setDeleting] = useState<PortfolioImage | null>(null)
  const [form, setForm] = useState(emptyImgForm())
  const [previewUrl, setPreviewUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const categories = Array.from(new Set(portfolio.map((image) => image.category))).sort()
  const categoryOptions = ['All', ...categories]

  const filtered = portfolio
    .filter((p) => category === 'All' || p.category === category)
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))

  const openAdd = () => {
    setForm(emptyImgForm())
    setPreviewUrl('')
    setSelectedFile(null)
    setIsAdding(true)
  }

  const openEdit = (img: PortfolioImage) => {
    setEditing(img)
    setForm({ title: img.title, category: img.category, date: img.date ?? '', description: img.description ?? '', featured: img.featured })
    setPreviewUrl(img.src)
    setSelectedFile(null)
  }

  const closeForm = () => {
    setIsAdding(false)
    setEditing(null)
  }

  const adminHeaders = () => ({ Authorization: `Bearer ${window.sessionStorage.getItem('uploadToken') ?? ''}`, 'x-upload-source': 'kc-upload' })

  const handleSave = async () => {
    if (isAdding) {
      if (!selectedFile) return
      const uploadData = new FormData()
      uploadData.append('file', selectedFile)
      uploadData.append('category', form.category.toLowerCase())
      uploadData.append('title', form.title)
      uploadData.append('caption', form.description)
      uploadData.append('featured', String(form.featured))
      const response = await fetch('/api/upload', { method: 'POST', headers: adminHeaders(), body: uploadData })
      if (!response.ok) return
      const body = await response.json()
      const item = body.item
      const newImg: PortfolioImage = {
        id: String(item.id), title: item.title, category: item.category, date: String(item.created_at ?? '').slice(0, 10), order: Number(item.sort_order), src: item.cloudinaryUrl, description: item.caption ?? undefined, featured: Boolean(item.featured),
      }
      setPortfolio((prev) => [...prev, newImg])
      addAudit({ activity: 'Portfolio Image Added', description: `"${form.title}" added to ${form.category}`, section: 'Portfolio', type: 'create' })
    } else if (editing) {
      if (selectedFile) {
        const uploadData = new FormData()
        uploadData.append('file', selectedFile)
        uploadData.append('category', form.category.toLowerCase())
        uploadData.append('title', form.title)
        uploadData.append('caption', form.description)
        uploadData.append('featured', String(form.featured))
        const uploadResponse = await fetch('/api/upload', { method: 'POST', headers: adminHeaders(), body: uploadData })
        if (!uploadResponse.ok) return
        const uploadBody = await uploadResponse.json()
        const oldDelete = await fetch('/api/portfolio-delete', { method: 'POST', headers: { ...adminHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id }) })
        if (!oldDelete.ok) return
        const item = uploadBody.item
        setPortfolio((prev) => prev.map((p) => p.id === editing.id ? { id: String(item.id), title: item.title, category: item.category, date: String(item.created_at ?? '').slice(0, 10), order: Number(item.sort_order), src: item.cloudinaryUrl, description: item.caption ?? undefined, featured: Boolean(item.featured) } : p))
        addAudit({ activity: 'Portfolio Image Edited', description: `"${form.title}" image replaced`, section: 'Portfolio', type: 'edit' })
        closeForm()
        return
      }
      const response = await fetch('/api/portfolio-item', { method: 'PATCH', headers: { ...adminHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, title: form.title, category: form.category.toLowerCase(), caption: form.description, featured: form.featured }) })
      if (!response.ok) return
      setPortfolio((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...form } : p)))
      addAudit({ activity: 'Portfolio Image Edited', description: `"${form.title}" updated`, section: 'Portfolio', type: 'edit' })
    }
    closeForm()
  }

  const handleDelete = async (img: PortfolioImage) => {
    const response = await fetch('/api/portfolio-delete', { method: 'POST', headers: { ...adminHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ id: img.id }) })
    if (!response.ok) return
    setPortfolio((prev) => prev.filter((p) => p.id !== img.id))
    addAudit({ activity: 'Portfolio Image Deleted', description: `"${img.title}" removed from ${img.category}`, section: 'Portfolio', type: 'delete', prev: img.title })
  }

  const moveItem = async (id: string, dir: -1 | 1) => {
    const reordered = [...portfolio]
    const i = reordered.findIndex((p) => p.id === id)
    const j = i + dir
    if (j < 0 || j >= reordered.length) return
    ;[reordered[i], reordered[j]] = [reordered[j], reordered[i]]
    const response = await fetch('/api/portfolio-reorder', { method: 'POST', headers: { ...adminHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: reordered.map((item) => item.id) }) })
    if (!response.ok) return
    setPortfolio(reordered.map((p, idx) => ({ ...p, order: idx + 1 })))
    addAudit({ activity: 'Portfolio Reordered', description: 'Portfolio image order updated', section: 'Portfolio', type: 'edit' })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader title="Portfolio">
        <SearchBar value={search} onChange={setSearch} placeholder="Search images..." />
        <div className="flex overflow-hidden rounded border border-[#272727]">
          {([['grid', LayoutGrid], ['list', List]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-2 transition-colors ${view === v ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`} style={{ background: view === v ? '#1a1a1a' : '#0d0d0d' }}>
              <Icon size={14} />
            </button>
          ))}
        </div>
        <Btn variant="red" onClick={openAdd}><Plus size={13} />Add Image</Btn>
      </PageHeader>

      <div className="flex flex-shrink-0 gap-1 overflow-x-auto border-b border-[#1e1e1e] bg-[#0a0a0a] px-6 py-3">
        {categoryOptions.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} className="whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium transition-all" style={{ background: category === cat ? RED : 'transparent', color: category === cat ? 'white' : '#666' }}>
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center rounded border border-dashed border-[#2a2a2a] text-xs uppercase tracking-[0.2em] text-zinc-600">
            No portfolio images
          </div>
        ) : view === 'grid' ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {filtered.map((img) => (
              <div key={img.id} className="group relative overflow-hidden rounded border border-[#222] bg-[#141414]">
                <div className="relative bg-zinc-900" style={{ aspectRatio: '4/3' }}>
                  <img src={img.src} alt={img.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: 'rgba(0,0,0,0.65)' }}>
                    <button onClick={() => openEdit(img)} className="rounded border border-white/10 p-2 text-white transition-colors hover:bg-white/10"><Edit2 size={13} /></button>
                    <button onClick={() => setDeleting(img)} className="rounded border border-white/10 p-2 text-white transition-colors hover:bg-white/10"><Trash2 size={13} /></button>
                  </div>
                  <div className="absolute left-2 top-2 cursor-grab text-white/30 transition-colors hover:text-white/60">
                    <GripVertical size={13} />
                  </div>
                  {img.featured && (
                    <div className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: RED }}>
                      Featured
                    </div>
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <div className="truncate text-sm font-medium text-white">{img.title}</div>
                  <div className="mt-0.5 text-[10px] text-zinc-600">{img.category}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <SectionCard>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {['Image', 'Title', 'Category', 'Date Added', 'Order', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((img) => (
                  <tr key={img.id} className="border-b border-[#181818] transition-colors hover:bg-[#191919]">
                    <td className="px-4 py-3"><img src={img.src} alt={img.title} className="h-9 w-14 rounded bg-zinc-900 object-cover" /></td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white">{img.title}</div>
                      {img.featured && <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-red-400">Featured</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{img.category}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500" style={{ fontFamily: MONO }}>{img.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center text-sm text-zinc-400" style={{ fontFamily: MONO }}>{img.order}</span>
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveItem(img.id, -1)} className="text-zinc-600 transition-colors hover:text-white"><ArrowUp size={10} /></button>
                          <button onClick={() => moveItem(img.id, 1)} className="text-zinc-600 transition-colors hover:text-white"><ArrowDown size={10} /></button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(img)} className="p-1.5 text-zinc-600 transition-colors hover:text-white"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleting(img)} className="p-1.5 text-zinc-600 transition-colors hover:text-red-400"><Trash2 size={13} /></button>
                        <GripVertical size={13} className="ml-1 cursor-grab text-zinc-700" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        )}
      </div>

      <Modal open={isAdding || !!editing} onClose={closeForm} title={isAdding ? 'Add Image' : 'Edit Image'} maxW="520px">
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Image</label>
            <div className="cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-[#2a2a2a] transition-colors hover:border-zinc-600" style={{ minHeight: 160 }} onClick={() => fileRef.current?.click()}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full object-cover" style={{ maxHeight: 200 }} />
              ) : (
                <div className="flex flex-col items-center gap-3 py-10">
                  <Upload size={18} className="text-zinc-600" />
                  <div className="text-center">
                    <div className="text-sm text-zinc-500">Drop image or click to upload</div>
                    <div className="mt-1 text-xs text-zinc-700">JPG, PNG, WEBP</div>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); setPreviewUrl(URL.createObjectURL(f)) } }} />
          </div>

          <FInput label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Image title" />

          <FSelect label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {categoryOptions.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c} style={{ background: '#141414' }}>{c}</option>
            ))}
          </FSelect>

          <FTextarea label="Description / Caption" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description or caption..." rows={3} />

          <Toggle label="Featured Image" value={form.featured} onChange={(v) => setForm((f) => ({ ...f, featured: v }))} />

          <div className="flex gap-3 border-t border-[#222] pt-3">
            <Btn onClick={closeForm} className="flex-1 justify-center">Cancel</Btn>
            <Btn variant="red" onClick={handleSave} className="flex-1 justify-center">Save Image</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => deleting && handleDelete(deleting)} name={deleting?.title || ''} />
    </div>
  )
}

const emptyPkgForm = () => ({ category: 'lifestyle', name: '', price: 0, description: '', duration: '', images: 0, features: '', status: 'active' as 'active' | 'inactive' })

function PackagesPage({ packages, setPackages, addAudit }: {
  packages: PackageItem[]
  setPackages: React.Dispatch<React.SetStateAction<PackageItem[]>>
  addAudit: (e: Omit<AuditEntry, 'id' | 'datetime'>) => void
}) {
  const [editing, setEditing] = useState<PackageItem | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deleting, setDeleting] = useState<PackageItem | null>(null)
  const [form, setForm] = useState(emptyPkgForm())

  const openAdd = () => {
    setForm(emptyPkgForm())
    setIsAdding(true)
  }

  const openEdit = (pkg: PackageItem) => {
    setEditing(pkg)
    setForm({ category: pkg.category, name: pkg.name, price: pkg.price, description: pkg.description ?? '', duration: pkg.duration ?? '', images: pkg.images ?? 0, features: pkg.features.join('\n'), status: pkg.status })
  }

  const closeForm = () => {
    setIsAdding(false)
    setEditing(null)
  }

  const adminHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${window.sessionStorage.getItem('uploadToken') ?? ''}`, 'x-upload-source': 'kc-upload' })

  const handleSave = async () => {
    const features = form.features.split('\n').map((f) => f.trim()).filter(Boolean)
    const response = await fetch('/api/package', { method: isAdding ? 'POST' : 'PATCH', headers: adminHeaders(), body: JSON.stringify({ id: editing?.id ?? crypto.randomUUID(), category: form.category, name: form.name, price: form.price, duration: form.duration, description: form.description, editedImages: form.images, features, active: form.status === 'active' }) })
    if (!response.ok) return
    const body = await response.json()
    const item = body.item
    const mapped = { id: String(item.id), category: item.category, name: item.name, price: Number(item.price), duration: item.duration ?? undefined, description: item.description ?? undefined, images: item.edited_images == null ? undefined : Number(item.edited_images), features: Array.isArray(item.features) ? item.features : [], status: item.active ? 'active' as const : 'inactive' as const }
    setPackages((prev) => isAdding ? [...prev, mapped] : prev.map((p) => p.id === editing?.id ? mapped : p))
    addAudit({ activity: isAdding ? 'Package Added' : 'Package Edited', description: `"${form.name}" ${isAdding ? 'created' : 'updated'}`, section: 'Packages', type: isAdding ? 'create' : 'edit' })
    closeForm()
  }

  const handleDelete = async (pkg: PackageItem) => {
    const response = await fetch('/api/package-delete', { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ id: pkg.id }) })
    if (!response.ok) return
    setPackages((prev) => prev.filter((p) => p.id !== pkg.id))
    addAudit({ activity: 'Package Deleted', description: `"${pkg.name}" package removed`, section: 'Packages', type: 'delete' })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader title="Packages">
        <Btn variant="red" onClick={openAdd}><Plus size={13} />Add Package</Btn>
      </PageHeader>
      <div className="flex-1 overflow-y-auto p-6">
        {packages.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center rounded border border-dashed border-[#2a2a2a] text-xs uppercase tracking-[0.2em] text-zinc-600">
            No packages
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {packages.map((pkg) => (
            <div key={pkg.id} className="flex flex-col gap-4 rounded border border-[#222] bg-[#141414] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-white" style={{ fontFamily: CONDENSED, fontSize: '1.15rem', letterSpacing: '0.04em' }}>
                      {pkg.name}
                    </span>
                    <span className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] ${pkg.status === 'active' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-500'}`}>
                      {pkg.status}
                    </span>
                  </div>
                  {pkg.description && <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{pkg.description}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-bold text-white" style={{ fontFamily: CONDENSED }}>${pkg.price.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Duration</div>
                  <div className="mt-0.5 text-xs text-zinc-300">{pkg.duration || '—'}</div>
                </div>
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Images</div>
                  <div className="mt-0.5 text-xs text-zinc-300">{pkg.images == null ? '—' : `${pkg.images} edited`}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {pkg.features.map((f) => (
                  <span key={f} className="rounded border border-[#2a2a2a] px-2 py-0.5 text-[10px] text-zinc-500">{f}</span>
                ))}
              </div>

              <div className="flex gap-2 border-t border-[#1e1e1e] pt-3">
                <Btn size="xs" onClick={() => openEdit(pkg)}><Edit2 size={11} />Edit</Btn>
                <Btn size="xs" variant="destructive" onClick={() => setDeleting(pkg)}><Trash2 size={11} />Delete</Btn>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={isAdding || !!editing} onClose={closeForm} title={isAdding ? 'Add Package' : 'Edit Package'} maxW="480px">
        <div className="flex flex-col gap-5">
          <FInput label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. lifestyle" />
          <FInput label="Package Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Wedding Day" />
          <div className="grid grid-cols-2 gap-4">
            <FInput label="Price ($)" type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} placeholder="0" />
            <FInput label="Duration" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="e.g. 4 hours" />
          </div>
          <FInput label="Edited Images" type="number" value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: Number(e.target.value) }))} placeholder="0" />
          <FTextarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Package description..." />
          <FTextarea label="Features (one per line)" value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} rows={5} placeholder={'Online gallery\nHigh-res downloads\nBasic retouching'} />
          <FSelect label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}>
            <option value="active" style={{ background: '#141414' }}>Active</option>
            <option value="inactive" style={{ background: '#141414' }}>Inactive</option>
          </FSelect>
          <div className="flex gap-3 border-t border-[#222] pt-3">
            <Btn onClick={closeForm} className="flex-1 justify-center">Cancel</Btn>
            <Btn variant="red" onClick={handleSave} className="flex-1 justify-center">Save Package</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => deleting && handleDelete(deleting)} name={deleting?.name || ''} />
    </div>
  )
}

const emptyTestiForm = () => ({ client: '', avatar: '', text: '', rating: 5, date: '', published: false })

function TestimonialsPage({ testimonials, setTestimonials, addAudit }: {
  testimonials: Testimonial[]
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>
  addAudit: (e: Omit<AuditEntry, 'id' | 'datetime'>) => void
}) {
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deleting, setDeleting] = useState<Testimonial | null>(null)
  const [form, setForm] = useState(emptyTestiForm())

  const openAdd = () => {
    setForm(emptyTestiForm())
    setIsAdding(true)
  }

  const openEdit = (t: Testimonial) => {
    setEditing(t)
    setForm({ client: t.client, avatar: t.avatar, text: t.text, rating: t.rating, date: t.date, published: t.published })
  }

  const closeForm = () => {
    setIsAdding(false)
    setEditing(null)
  }

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${window.sessionStorage.getItem('uploadToken') ?? ''}`,
    'x-upload-source': 'kc-upload',
  })

  const handleSave = async () => {
    const payload = { clientName: form.client, imageUrl: form.avatar, content: form.text, rating: form.rating, date: form.date, clientRole: '', published: form.published }
    const response = await fetch('/api/testimonials', { method: isAdding ? 'POST' : 'PATCH', headers: adminHeaders(), body: JSON.stringify(isAdding ? payload : { ...payload, id: editing?.id }) })
    const body = await response.json()
    if (!response.ok || !body.testimonial) return
    setTestimonials((prev) => isAdding ? [...prev, { id: body.testimonial.id, client: body.testimonial.clientName, avatar: body.testimonial.imageUrl ?? '', text: body.testimonial.content, rating: body.testimonial.rating, date: body.testimonial.date ?? String(body.testimonial.createdAt).slice(0, 10), published: body.testimonial.published }] : prev.map((t) => t.id === editing?.id ? { ...t, ...form } : t))
    addAudit({ activity: isAdding ? 'Testimonial Added' : 'Testimonial Edited', description: `${form.client}'s testimonial ${isAdding ? 'created' : 'updated'}`, section: 'Testimonials', type: isAdding ? 'create' : 'edit' })
    closeForm()
  }

  const handleDelete = async (t: Testimonial) => {
    const response = await fetch('/api/testimonials', { method: 'DELETE', headers: adminHeaders(), body: JSON.stringify({ id: t.id }) })
    if (!response.ok) return
    setTestimonials((prev) => prev.filter((x) => x.id !== t.id))
    addAudit({ activity: 'Testimonial Deleted', description: `${t.client}'s testimonial removed`, section: 'Testimonials', type: 'delete' })
  }

  const togglePublish = async (t: Testimonial) => {
    const published = !t.published
    const response = await fetch('/api/testimonials', { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ id: t.id, published }) })
    if (!response.ok) return
    setTestimonials((prev) => prev.map((x) => (x.id === t.id ? { ...x, published } : x)))
    addAudit({ activity: 'Testimonial Publication Changed', description: `${t.client}'s testimonial ${t.published ? 'unpublished' : 'published'}`, section: 'Testimonials', type: 'edit', prev: t.published ? 'Published' : 'Unpublished', next: t.published ? 'Unpublished' : 'Published' })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader title="Testimonials">
        <Btn variant="red" onClick={openAdd}><Plus size={13} />Add Testimonial</Btn>
      </PageHeader>
      <div className="flex-1 overflow-y-auto p-6">
        {testimonials.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center rounded border border-dashed border-[#2a2a2a] text-xs uppercase tracking-[0.2em] text-zinc-600">No testimonials</div>
        ) : <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {testimonials.map((t) => (
            <div key={t.id} className="flex flex-col gap-4 rounded border border-[#222] bg-[#141414] p-5">
              <div className="flex items-start gap-3.5">
                <img src={t.avatar} alt={t.client} className="h-10 w-10 flex-shrink-0 rounded-full object-cover bg-zinc-800" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">{t.client}</span>
                    <span className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] ${t.published ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-500'}`}>
                      {t.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <StarDisplay rating={t.rating} />
                    <span className="text-[10px] text-zinc-600" style={{ fontFamily: MONO }}>{t.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm italic leading-relaxed text-zinc-400">"{t.text}"</p>
              <div className="flex gap-2 border-t border-[#1e1e1e] pt-3">
                <Btn size="xs" onClick={() => togglePublish(t)}>
                  {t.published ? <EyeOff size={11} /> : <Eye size={11} />}
                  {t.published ? 'Unpublish' : 'Publish'}
                </Btn>
                <Btn size="xs" onClick={() => openEdit(t)}><Edit2 size={11} />Edit</Btn>
                <Btn size="xs" variant="destructive" onClick={() => setDeleting(t)}><Trash2 size={11} />Delete</Btn>
              </div>
            </div>
          ))}
        </div>}
      </div>

      <Modal open={isAdding || !!editing} onClose={closeForm} title={isAdding ? 'Add Testimonial' : 'Edit Testimonial'} maxW="480px">
        <div className="flex flex-col gap-5">
          <FInput label="Client Name" value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} placeholder="Client full name" />
          <FInput label="Client Photo URL" value={form.avatar} onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))} placeholder="https://..." />
          <FTextarea label="Testimonial" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} rows={4} placeholder="What the client said..." />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Rating</label>
            <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
          </div>
          <FInput label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <Toggle label="Published" value={form.published} onChange={(v) => setForm((f) => ({ ...f, published: v }))} />
          <div className="flex gap-3 border-t border-[#222] pt-3">
            <Btn onClick={closeForm} className="flex-1 justify-center">Cancel</Btn>
            <Btn variant="red" onClick={handleSave} className="flex-1 justify-center">Save Testimonial</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => deleting && handleDelete(deleting)} name={deleting?.client || ''} />
    </div>
  )
}

function BookingsPage({ bookings, setBookings, addAudit }: {
  bookings: Booking[]
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>
  addAudit: (e: Omit<AuditEntry, 'id' | 'datetime'>) => void
}) {
  const changeStatus = async (id: string, prev: BookingStatus, next: BookingStatus) => {
    if (prev === next) return
    const statusValues: Record<BookingStatus, string> = { Pending: 'pending', 'To Confirm': 'to_confirm', Confirmed: 'confirmed' }
    const response = await fetch('/api/bookings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.sessionStorage.getItem('uploadToken') ?? ''}`,
        'x-upload-source': 'kc-upload',
      },
      body: JSON.stringify({ id, status: statusValues[next] }),
    })
    if (!response.ok) return
    setBookings((b) => b.map((bk) => (bk.id === id ? { ...bk, status: next } : bk)))
    const bk = bookings.find((b) => b.id === id)
    addAudit({ activity: 'Booking Status Changed', description: `${bk?.client} booking updated`, section: 'Bookings', type: 'status', prev, next })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader title="Bookings" />
      <div className="flex-1 overflow-y-auto p-6">
        {bookings.length === 0 ? <div className="flex min-h-48 items-center justify-center rounded border border-dashed border-[#2a2a2a] text-xs uppercase tracking-[0.2em] text-zinc-600">No bookings</div> : <SectionCard>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {['Client', 'Contact', 'Package', 'Preferred Date', 'Request Date', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((bk) => (
                <tr key={bk.id} className="border-b border-[#181818] transition-colors hover:bg-[#191919]">
                  <td className="px-5 py-4"><div className="text-sm font-medium text-white">{bk.client}</div></td>
                  <td className="px-5 py-4"><div className="text-xs text-zinc-400">{bk.email}</div><div className="mt-0.5 text-xs text-zinc-600">{bk.phone}</div></td>
                  <td className="px-5 py-4 text-sm text-zinc-300">{bk.package}</td>
                  <td className="px-5 py-4 text-xs text-zinc-400" style={{ fontFamily: MONO }}>{bk.preferredDate}</td>
                  <td className="px-5 py-4 text-xs text-zinc-500" style={{ fontFamily: MONO }}>{bk.requestDate}</td>
                  <td className="px-5 py-4">
                    <select value={bk.status} onChange={(e) => changeStatus(bk.id, bk.status, e.target.value as BookingStatus)} className={`cursor-pointer rounded border px-2.5 py-1.5 text-xs font-semibold outline-none transition-colors ${BOOKING_STYLES[bk.status]}`} style={{ background: 'transparent' }}>
                      {(['Pending', 'To Confirm', 'Confirmed'] as BookingStatus[]).map((s) => (
                        <option key={s} value={s} style={{ background: '#141414', color: '#f2f2f2' }}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>}
      </div>
    </div>
  )
}

function AuditTrailPage({ audit }: { audit: AuditEntry[] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [selected, setSelected] = useState<AuditEntry | null>(null)

  const filtered = audit
    .filter((e) => typeFilter === 'All' || e.type === typeFilter)
    .filter((e) => e.activity.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()) || e.section.toLowerCase().includes(search.toLowerCase()))

  const auditTypes: (AuditType | 'All')[] = ['All', 'create', 'edit', 'delete', 'login', 'logout', 'status', 'settings']

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader title="Audit Trail">
        <SearchBar value={search} onChange={setSearch} placeholder="Search activity..." />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded border border-[#272727] bg-[#0d0d0d] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-zinc-500" >
          {auditTypes.map((t) => (
            <option key={t} value={t} style={{ background: '#0d0d0d' }}>{t === 'All' ? 'All Types' : (AUDIT_STYLES[t as AuditType]?.label || t)}</option>
          ))}
        </select>
      </PageHeader>

      <div className="flex-shrink-0 border-b border-[#1a1a1a] bg-[#0a0a0a] px-7 py-2.5">
        <p className="text-xs text-zinc-600">Track recent activity and changes made within the dashboard.</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <SectionCard>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {['Date & Time', 'Activity', 'Description', 'Section', 'Type'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => {
                  const s = AUDIT_STYLES[entry.type]
                  const isSel = selected?.id === entry.id
                  return (
                    <tr key={entry.id} className={`cursor-pointer border-b border-[#181818] transition-colors ${isSel ? 'bg-[#1c1c1c]' : 'hover:bg-[#181818]'}`} onClick={() => setSelected(isSel ? null : entry)}>
                      <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap" style={{ fontFamily: MONO }}>{entry.datetime}</td>
                      <td className="px-4 py-3 text-sm text-white">{entry.activity}</td>
                      <td className="max-w-xs px-4 py-3 text-xs text-zinc-400">{entry.description}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{entry.section}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                          <span className={`text-xs ${s.text}`}>{s.label}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-600">No activity matches your filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </SectionCard>
        </div>

        {selected && (
          <div className="flex w-72 shrink-0 flex-col border-l border-[#1e1e1e] bg-[#0d0d0d]">
            <div className="flex items-center justify-between border-b border-[#1e1e1e] px-5 py-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white" style={{ fontFamily: CONDENSED }}>Activity Detail</span>
              <button onClick={() => setSelected(null)} className="p-0.5 text-zinc-600 transition-colors hover:text-white"><X size={13} /></button>
            </div>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
              {([
                { label: 'Timestamp', value: selected.datetime },
                { label: 'Activity', value: selected.activity },
                { label: 'Description', value: selected.description },
                { label: 'Section', value: selected.section },
              ] as const).map(({ label, value }) => (
                <div key={label}>
                  <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{label}</div>
                  <div className="text-xs leading-relaxed text-zinc-300">{value}</div>
                </div>
              ))}

              {(selected.prev || selected.next) && (
                <div className="flex flex-col gap-3 border-t border-[#222] pt-4">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Changes</div>
                  {selected.prev && (
                    <div>
                      <div className="mb-1.5 text-[9px] text-zinc-600">Previous Value</div>
                      <div className="rounded border border-red-500/20 bg-red-500/5 px-2.5 py-2 text-xs leading-relaxed text-red-400">{selected.prev}</div>
                    </div>
                  )}
                  {selected.next && (
                    <div>
                      <div className="mb-1.5 text-[9px] text-zinc-600">New Value</div>
                      <div className="rounded border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-2 text-xs leading-relaxed text-emerald-400">{selected.next}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <div className={`h-2 w-2 rounded-full ${AUDIT_STYLES[selected.type].dot}`} />
                <span className={`text-xs font-medium ${AUDIT_STYLES[selected.type].text}`}>{AUDIT_STYLES[selected.type].label}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsPage({ addAudit }: { addAudit: (e: Omit<AuditEntry, 'id' | 'datetime'>) => void }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    studioName: 'KCAPTURED Studios', email: '', phone: '', location: '', instagram: '', bookingEmail: '', bookingMessage: '',
    maxBookings: '10',
  })

  useEffect(() => {
    fetch('/api/settings', { headers: { Authorization: `Bearer ${window.sessionStorage.getItem('uploadToken') ?? ''}`, 'x-upload-source': 'kc-upload' } })
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); return body })
      .then((settings) => setForm((current) => ({ ...current, studioName: settings.studioName, email: settings.email ?? '', phone: settings.phone ?? '', instagram: settings.instagramHandle ?? '', bookingEmail: settings.bookingEmail ?? '', maxBookings: String(settings.maxConcurrentBookings ?? 10) })))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setError('')
    const response = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${window.sessionStorage.getItem('uploadToken') ?? ''}`, 'x-upload-source': 'kc-upload' }, body: JSON.stringify({ studioName: form.studioName, email: form.email, phone: form.phone, instagramHandle: form.instagram, bookingEmail: form.bookingEmail, maxConcurrentBookings: form.maxBookings }) })
    if (!response.ok) { const body = await response.json(); setError(body.error ?? 'Failed to save settings'); return }
    addAudit({ activity: 'Settings Updated', description: 'Studio settings saved', section: 'Settings', type: 'settings' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader title="Settings" />
      <div className="flex-1 overflow-y-auto p-6">
        {loading && <div className="mb-5 text-xs uppercase tracking-[0.2em] text-zinc-600">Loading settings...</div>}
        {error && <div className="mb-5 text-sm text-red-400">{error}</div>}
        <div className="flex max-w-[520px] flex-col gap-5">
          <SectionCard title="Studio Information">
            <div className="flex flex-col gap-4 p-5">
              <FInput label="Studio Name" value={form.studioName} onChange={(e) => setForm((f) => ({ ...f, studioName: e.target.value }))} />
              <FInput label="Contact Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <FInput label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              <FInput label="Instagram Handle" value={form.instagram} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))} />
              <FInput label="Booking Email" type="email" value={form.bookingEmail} onChange={(e) => setForm((f) => ({ ...f, bookingEmail: e.target.value }))} />
            </div>
          </SectionCard>

          <SectionCard title="Booking Settings">
            <div className="flex flex-col gap-4 p-5">
              <FInput label="Max Concurrent Bookings" type="number" value={form.maxBookings} onChange={(e) => setForm((f) => ({ ...f, maxBookings: e.target.value }))} />
            </div>
          </SectionCard>

          <div>
            <Btn variant="red" onClick={handleSave} className="min-w-[140px] justify-center">{saved ? <><Check size={13} />Saved</> : 'Save Changes'}</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FigmaAdmin({ initialSection = 'dashboard' }: { initialSection?: Section }) {
  const [section, setSection] = useState<Section>(initialSection)
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([])
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        const adminHeaders = {
          Authorization: `Bearer ${window.sessionStorage.getItem('uploadToken') ?? ''}`,
          'x-upload-source': 'kc-upload',
        }
        const [packagesResponse, portfolioResponse, testimonialsResponse, bookingsResponse, auditResponse] = await Promise.all([
          fetch('/api/packages?includeInactive=true'),
          fetch('/api/portfolio-images'),
          fetch('/api/testimonials?includeDrafts=true', { headers: adminHeaders }),
          fetch('/api/bookings', { headers: adminHeaders }),
          fetch('/api/audit', { headers: adminHeaders }),
        ])
        if (!packagesResponse.ok || !portfolioResponse.ok || !testimonialsResponse.ok || !bookingsResponse.ok || !auditResponse.ok) throw new Error('Admin data could not be loaded. Verify your admin session.')

        const [packageRows, portfolioRows, testimonialRows, bookingRows, auditRows] = await Promise.all([
          packagesResponse.json(),
          portfolioResponse.json(),
          testimonialsResponse.ok ? testimonialsResponse.json() : Promise.resolve([]),
          bookingsResponse.ok ? bookingsResponse.json() : Promise.resolve([]),
          auditResponse.json(),
        ])

        if (!mounted) return
        setPackages((Array.isArray(packageRows) ? packageRows : []).map((row) => ({
          id: String(row.id),
          category: String(row.category ?? ''),
          name: String(row.name ?? ''),
          price: Number(row.price ?? 0),
          duration: row.duration ?? undefined,
          description: row.description ?? undefined,
          images: row.editedImages == null ? undefined : Number(row.editedImages),
          features: Array.isArray(row.features) ? row.features.map(String) : [],
          status: row.active ? 'active' : 'inactive',
        })))
        setPortfolio((Array.isArray(portfolioRows) ? portfolioRows : []).map((row, index) => ({
          id: String(row.id),
          title: String(row.title ?? ''),
          category: String(row.category ?? ''),
          date: row.created_at ? String(row.created_at).slice(0, 10) : undefined,
          order: Number(row.sort_order ?? index + 1),
          src: String(row.cloudinaryUrl ?? ''),
          description: row.caption ?? undefined,
          featured: Boolean(row.featured),
        })))
        setTestimonials((Array.isArray(testimonialRows) ? testimonialRows : []).map((row) => ({
          id: String(row.id),
          client: String(row.clientName ?? ''),
          avatar: row.imageUrl ?? '',
          text: String(row.content ?? ''),
          rating: Number(row.rating ?? 5),
          date: row.date ?? (row.createdAt ? String(row.createdAt).slice(0, 10) : ''),
          published: Boolean(row.published),
        })))
        const statusLabels: Record<string, BookingStatus> = { pending: 'Pending', to_confirm: 'To Confirm', confirmed: 'Confirmed' }
        setBookings((Array.isArray(bookingRows) ? bookingRows : []).map((row) => ({
          id: String(row.id),
          client: String(row.client ?? ''),
          email: String(row.email ?? ''),
          phone: String(row.phone ?? ''),
          package: String(row.package ?? ''),
          preferredDate: row.preferredDate ? String(row.preferredDate).slice(0, 10) : '—',
          requestDate: row.requestDate ? String(row.requestDate).slice(0, 10) : '—',
          status: statusLabels[row.status] ?? 'Pending',
        })))
        setAudit((Array.isArray(auditRows) ? auditRows : []).map((row) => ({ ...row, id: String(row.id), datetime: String(row.datetime), type: row.type as AuditType })))
      } catch (error) {
        console.error('[figma-admin] failed to load packages or portfolio', error)
        if (mounted) {
          setDataError(error instanceof Error ? error.message : 'Admin data could not be loaded')
          setPackages([])
          setPortfolio([])
        }
      } finally {
        if (mounted) setDataLoading(false)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [])

  const addAudit = (entry: Omit<AuditEntry, 'id' | 'datetime'>) => {
    const action = entry.type === 'create' ? 'created' : entry.type === 'delete' ? 'deleted' : entry.type === 'edit' ? 'edited' : entry.type === 'status' ? 'status_changed' : entry.type
    void fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${window.sessionStorage.getItem('uploadToken') ?? ''}`, 'x-upload-source': 'kc-upload' }, body: JSON.stringify({ action, entityType: entry.section, description: entry.description }) })
      .then(async (response) => { if (!response.ok) throw new Error('Audit write failed'); return response.json() })
      .then((record) => setAudit((prev) => [record, ...prev]))
      .catch((error) => console.error('[figma-admin] audit write failed', error))
  }

  return (
    <>
      <style>{`
        * { font-family: 'Outfit', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-[#080808] text-[#f2f2f2]">
        <Sidebar active={section} onNavigate={setSection} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {dataError && <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-3 text-sm text-red-300">{dataError}</div>}
          {dataLoading ? (
            <div className="flex flex-1 items-center justify-center text-xs uppercase tracking-[0.2em] text-zinc-600">Loading data...</div>
          ) : dataError ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-red-300">{dataError}</div>
          ) : (
            <>
              {section === 'dashboard' && <DashboardPage portfolio={portfolio} packages={packages} testimonials={testimonials} bookings={bookings} audit={audit} onNavigate={setSection} />}
              {section === 'portfolio' && <PortfolioPage portfolio={portfolio} setPortfolio={setPortfolio} addAudit={addAudit} />}
              {section === 'packages' && <PackagesPage packages={packages} setPackages={setPackages} addAudit={addAudit} />}
            </>
          )}
          {section === 'testimonials' && <TestimonialsPage testimonials={testimonials} setTestimonials={setTestimonials} addAudit={addAudit} />}
          {section === 'bookings' && <BookingsPage bookings={bookings} setBookings={setBookings} addAudit={addAudit} />}
          {section === 'trail' && <AuditTrailPage audit={audit} />}
          {section === 'settings' && <SettingsPage addAudit={addAudit} />}
        </div>
      </div>
    </>
  )
}
