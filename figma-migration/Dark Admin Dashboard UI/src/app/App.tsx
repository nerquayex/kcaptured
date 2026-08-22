import React, { useState, useRef } from "react";
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
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "dashboard" | "portfolio" | "packages" | "testimonials" | "bookings" | "trail" | "settings";
type BookingStatus = "Pending" | "To Confirm" | "Confirmed";
type AuditType = "create" | "edit" | "delete" | "login" | "logout" | "status" | "settings";

interface PortfolioImage {
  id: number; title: string; category: string; date: string; order: number;
  src: string; description: string; featured: boolean;
}
interface PackageItem {
  id: number; name: string; price: number; description: string; duration: string;
  images: number; features: string[]; status: "active" | "inactive";
}
interface Testimonial {
  id: number; client: string; avatar: string; text: string;
  rating: number; date: string; published: boolean;
}
interface Booking {
  id: number; client: string; email: string; phone: string; package: string;
  preferredDate: string; requestDate: string; status: BookingStatus;
}
interface AuditEntry {
  id: number; datetime: string; activity: string; description: string;
  section: string; type: AuditType; prev?: string; next?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RED = "#E50914";
const CATS = ["All", "Lifestyle", "Events", "Studio", "Weddings", "Portraits", "Other"];
const MONO = "'JetBrains Mono', monospace";
const CONDENSED = "'Barlow Condensed', sans-serif";
const SANS = "'Outfit', system-ui, sans-serif";

const AUDIT_STYLES: Record<AuditType, { dot: string; text: string; label: string }> = {
  create:   { dot: "bg-emerald-500", text: "text-emerald-400", label: "Create" },
  edit:     { dot: "bg-blue-400",    text: "text-blue-400",    label: "Edit" },
  delete:   { dot: "bg-red-500",     text: "text-red-400",     label: "Delete" },
  login:    { dot: "bg-zinc-500",    text: "text-zinc-500",    label: "Login" },
  logout:   { dot: "bg-zinc-500",    text: "text-zinc-500",    label: "Logout" },
  status:   { dot: "bg-amber-400",   text: "text-amber-400",   label: "Status" },
  settings: { dot: "bg-purple-400",  text: "text-purple-400",  label: "Settings" },
};

const BOOKING_STYLES: Record<BookingStatus, string> = {
  "Pending":    "bg-amber-500/10 text-amber-400 border border-amber-500/25",
  "To Confirm": "bg-orange-500/10 text-orange-400 border border-orange-500/25",
  "Confirmed":  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
};

// ─── Initial Data ─────────────────────────────────────────────────────────────

const PORTFOLIO_DATA: PortfolioImage[] = [
  { id: 1, title: "Golden Hour", category: "Lifestyle", date: "2024-03-15", order: 1, src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format", description: "Warm lifestyle shot at golden hour in the mountains", featured: true },
  { id: 2, title: "The Grand Evening", category: "Events", date: "2024-03-12", order: 2, src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format", description: "Corporate event coverage with dramatic lighting", featured: false },
  { id: 3, title: "Studio Portrait", category: "Studio", date: "2024-03-10", order: 3, src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=400&fit=crop&auto=format", description: "Dramatic studio portrait with dark background", featured: true },
  { id: 4, title: "Vows", category: "Weddings", date: "2024-03-08", order: 4, src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=400&fit=crop&auto=format", description: "Intimate wedding ceremony moment", featured: false },
  { id: 5, title: "Sofia", category: "Portraits", date: "2024-03-05", order: 5, src: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600&h=400&fit=crop&auto=format", description: "Editorial portrait session with natural light", featured: false },
  { id: 6, title: "City Light", category: "Lifestyle", date: "2024-03-01", order: 6, src: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&h=400&fit=crop&auto=format", description: "Urban lifestyle photography at dusk", featured: false },
  { id: 7, title: "First Dance", category: "Weddings", date: "2024-02-28", order: 7, src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&auto=format", description: "Emotional first dance moment", featured: true },
  { id: 8, title: "Backstage", category: "Events", date: "2024-02-25", order: 8, src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop&auto=format", description: "Behind the scenes event coverage", featured: false },
];

const PACKAGES_DATA: PackageItem[] = [
  { id: 1, name: "Essential", price: 499, description: "Perfect for intimate sessions and personal portraits.", duration: "2 hours", images: 20, features: ["1 location", "Online gallery", "High-res downloads", "Basic retouching"], status: "active" },
  { id: 2, name: "Studio", price: 899, description: "Full studio session with professional lighting setup.", duration: "4 hours", images: 40, features: ["Studio access", "2 outfit changes", "Hair & makeup consult", "Premium retouching", "Print-ready files"], status: "active" },
  { id: 3, name: "Wedding Day", price: 2499, description: "Complete wedding day coverage from prep to reception.", duration: "8 hours", images: 300, features: ["2 photographers", "All-day coverage", "Engagement session", "Album design", "Priority editing", "90-day gallery"], status: "active" },
  { id: 4, name: "Corporate", price: 1200, description: "Professional corporate events and headshot sessions.", duration: "6 hours", images: 80, features: ["Event coverage", "Executive headshots", "Same-day preview", "Commercial license", "Brand kit integration"], status: "inactive" },
];

const TESTIMONIALS_DATA: Testimonial[] = [
  { id: 1, client: "Amara Osei", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&auto=format", text: "Absolutely stunning work. The way the light was captured in our portraits took our breath away. A true artist behind the lens.", rating: 5, date: "2024-03-10", published: true },
  { id: 2, client: "James Whitfield", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format", text: "Our wedding photos are everything we dreamed of and more. Every emotion, every detail — perfectly preserved. We could not be happier.", rating: 5, date: "2024-02-22", published: true },
  { id: 3, client: "Mia Chen", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&auto=format", text: "The corporate event coverage exceeded our expectations. Delivered on time, professional throughout, and the results were exceptional.", rating: 4, date: "2024-02-15", published: false },
  { id: 4, client: "Daniel Reyes", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&auto=format", text: "My studio portrait session transformed my professional image. The photographer understood exactly what I needed and delivered beyond expectations.", rating: 5, date: "2024-01-30", published: true },
];

const BOOKINGS_DATA: Booking[] = [
  { id: 1, client: "Elena Vasquez", email: "elena.v@email.com", phone: "+1 555 0142", package: "Wedding Day", preferredDate: "2024-06-15", requestDate: "2024-03-18", status: "Pending" },
  { id: 2, client: "Marcus Thompson", email: "marcus.t@email.com", phone: "+1 555 0198", package: "Studio", preferredDate: "2024-04-22", requestDate: "2024-03-17", status: "To Confirm" },
  { id: 3, client: "Priya Sharma", email: "priya.s@email.com", phone: "+1 555 0267", package: "Essential", preferredDate: "2024-04-05", requestDate: "2024-03-16", status: "Confirmed" },
  { id: 4, client: "Luca Moretti", email: "luca.m@email.com", phone: "+1 555 0311", package: "Corporate", preferredDate: "2024-05-10", requestDate: "2024-03-15", status: "Pending" },
  { id: 5, client: "Sophie Laurent", email: "sophie.l@email.com", phone: "+1 555 0489", package: "Wedding Day", preferredDate: "2024-07-20", requestDate: "2024-03-14", status: "Confirmed" },
  { id: 6, client: "Kwame Asante", email: "kwame.a@email.com", phone: "+1 555 0522", package: "Portraits", preferredDate: "2024-04-18", requestDate: "2024-03-12", status: "To Confirm" },
];

const AUDIT_DATA: AuditEntry[] = [
  { id: 1, datetime: "2024-03-18 14:32:11", activity: "Booking Status Changed", description: 'Marcus Thompson booking moved to "To Confirm"', section: "Bookings", type: "status", prev: "Pending", next: "To Confirm" },
  { id: 2, datetime: "2024-03-18 13:15:44", activity: "Portfolio Image Added", description: '"Golden Hour" added to Lifestyle category', section: "Portfolio", type: "create" },
  { id: 3, datetime: "2024-03-18 11:02:30", activity: "Package Edited", description: '"Studio" package price updated from $799 to $899', section: "Packages", type: "edit", prev: "$799", next: "$899" },
  { id: 4, datetime: "2024-03-17 17:45:00", activity: "Login", description: "Admin session started", section: "System", type: "login" },
  { id: 5, datetime: "2024-03-17 09:20:15", activity: "Testimonial Published", description: "Amara Osei testimonial marked as published", section: "Testimonials", type: "edit", prev: "Unpublished", next: "Published" },
  { id: 6, datetime: "2024-03-16 16:10:22", activity: "Portfolio Image Deleted", description: '"Autumn Streets" removed from Lifestyle', section: "Portfolio", type: "delete", prev: "Autumn Streets" },
  { id: 7, datetime: "2024-03-16 14:55:08", activity: "Settings Updated", description: "Studio name and contact email updated", section: "Settings", type: "settings", prev: "lens@studio.com", next: "hello@lensstudio.com" },
  { id: 8, datetime: "2024-03-15 18:00:01", activity: "Logout", description: "Admin session ended", section: "System", type: "logout" },
  { id: 9, datetime: "2024-03-15 11:30:45", activity: "Package Added", description: '"Essential" package created at $499', section: "Packages", type: "create" },
  { id: 10, datetime: "2024-03-14 10:22:33", activity: "Portfolio Reordered", description: "8 images reordered in portfolio display", section: "Portfolio", type: "edit" },
  { id: 11, datetime: "2024-03-13 15:15:19", activity: "Testimonial Added", description: "New testimonial from James Whitfield", section: "Testimonials", type: "create" },
  { id: 12, datetime: "2024-03-12 09:44:02", activity: "Booking Status Changed", description: "Priya Sharma booking confirmed", section: "Bookings", type: "status", prev: "To Confirm", next: "Confirmed" },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-7 h-14 border-b border-[#1E1E1E] flex-shrink-0" style={{ background: "#0A0A0A" }}>
      <h1 className="text-xs font-bold tracking-[0.2em] uppercase text-white" style={{ fontFamily: CONDENSED, fontSize: "0.8rem", letterSpacing: "0.18em" }}>{title}</h1>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

function Btn({ onClick, children, variant = "default", size = "sm", className = "", type = "button" }: {
  onClick?: () => void; children: React.ReactNode;
  variant?: "default" | "red" | "ghost" | "destructive";
  size?: "sm" | "xs"; className?: string; type?: "button" | "submit";
}) {
  const base = "inline-flex items-center gap-1.5 font-medium transition-all rounded cursor-pointer border select-none";
  const sizes: Record<string, string> = { sm: "px-3.5 py-2 text-sm", xs: "px-2.5 py-1.5 text-xs" };
  const variants: Record<string, string> = {
    default:     "bg-[#1A1A1A] border-[#2E2E2E] text-zinc-300 hover:text-white hover:border-zinc-500",
    red:         "border-transparent text-white hover:opacity-90",
    ghost:       "bg-transparent border-transparent text-zinc-500 hover:text-white",
    destructive: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20",
  };
  return (
    <button type={type} onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      style={variant === "red" ? { background: RED } : undefined}>
      {children}
    </button>
  );
}

function FInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">{label}</label>
      <input {...props} className="px-3 py-2.5 text-sm text-white border border-[#272727] rounded outline-none focus:border-zinc-500 transition-colors" style={{ background: "#0D0D0D", fontFamily: SANS }} />
    </div>
  );
}

function FTextarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">{label}</label>
      <textarea {...props} className="px-3 py-2.5 text-sm text-white border border-[#272727] rounded outline-none focus:border-zinc-500 transition-colors resize-none" style={{ background: "#0D0D0D", fontFamily: SANS }} />
    </div>
  );
}

function FSelect({ label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">{label}</label>
      <select {...props} className="px-3 py-2.5 text-sm text-white border border-[#272727] rounded outline-none focus:border-zinc-500 transition-colors" style={{ background: "#0D0D0D" }}>
        {children}
      </select>
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">{label}</span>}
      <button type="button" onClick={() => onChange(!value)}
        className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
        style={{ background: value ? RED : "#333" }}>
        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ transform: value ? "translateX(20px)" : "translateX(0)" }} />
      </button>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="pl-8 pr-3 py-2 text-xs border border-[#272727] rounded text-white placeholder-zinc-700 outline-none focus:border-zinc-500 transition-colors w-52"
        style={{ background: "#0D0D0D" }} />
    </div>
  );
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.88)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Modal({ open, onClose, title, children, maxW = "480px" }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; maxW?: string;
}) {
  if (!open) return null;
  return (
    <Overlay onClose={onClose}>
      <div className="w-full rounded border border-[#2A2A2A] flex flex-col overflow-hidden"
        style={{ background: "#141414", maxHeight: "90vh", width: `min(90vw, ${maxW})` }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242424] flex-shrink-0">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white" style={{ fontFamily: CONDENSED }}>{title}</span>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors p-0.5"><X size={14} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </Overlay>
  );
}

function ConfirmModal({ open, onClose, onConfirm, name }: {
  open: boolean; onClose: () => void; onConfirm: () => void; name: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Deletion" maxW="380px">
      <div className="flex flex-col gap-6">
        <p className="text-sm text-zinc-400 leading-relaxed">
          This will permanently delete <span className="text-white font-medium">"{name}"</span>. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="red" onClick={() => { onConfirm(); onClose(); }}>Delete</Btn>
        </div>
      </div>
    </Modal>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11} className={i <= rating ? "text-amber-400 fill-amber-400" : "text-zinc-700"} />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button" onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(0)} onClick={() => onChange(i)}>
          <Star size={20} className={(hov || value) >= i ? "text-amber-400 fill-amber-400" : "text-zinc-700 hover:text-zinc-500"} />
        </button>
      ))}
    </div>
  );
}

function SectionCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-[#222] rounded overflow-hidden ${className}`} style={{ background: "#141414" }}>
      {title && (
        <div className="px-5 py-3 border-b border-[#1E1E1E]">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500">{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: "dashboard",    label: "Dashboard",    Icon: LayoutDashboard },
  { id: "portfolio",    label: "Portfolio",    Icon: ImageIcon },
  { id: "packages",     label: "Packages",     Icon: Package },
  { id: "testimonials", label: "Testimonials", Icon: MessageSquare },
  { id: "bookings",     label: "Bookings",     Icon: Calendar },
  { id: "trail",        label: "Trail",        Icon: Shield },
  { id: "settings",     label: "Settings",     Icon: Settings },
];

function Sidebar({ active, onNavigate }: { active: Section; onNavigate: (s: Section) => void }) {
  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-[#1A1A1A]" style={{ background: "#0D0D0D" }}>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1A1A1A]">
        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: RED }}>
          <Aperture size={13} className="text-white" />
        </div>
        <div>
          <div className="text-white text-sm font-bold tracking-widest uppercase leading-none" style={{ fontFamily: CONDENSED }}>Lens</div>
          <div className="text-zinc-700 text-[9px] tracking-[0.18em] uppercase mt-0.5">Studio Admin</div>
        </div>
      </div>

      <nav className="flex-1 py-5 flex flex-col gap-0.5 px-3 overflow-y-auto">
        {NAV.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onNavigate(id)}
              className="relative flex items-center gap-3 py-2.5 px-3 rounded text-left w-full transition-all text-sm group"
              style={isActive ? { background: "#1C1C1C" } : undefined}>
              {isActive && (
                <span className="absolute left-0 inset-y-1.5 w-[2px] rounded-r" style={{ background: RED }} />
              )}
              <Icon size={14} className={isActive ? "" : "text-zinc-600 group-hover:text-zinc-400 transition-colors"}
                style={isActive ? { color: RED } : undefined} />
              <span className={`font-medium transition-colors ${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[#1A1A1A]">
        <div className="text-zinc-700 text-[9px] tracking-widest uppercase" style={{ fontFamily: MONO }}>v1.0.0</div>
      </div>
    </aside>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardPage({ portfolio, packages, testimonials, bookings, audit, onNavigate }: {
  portfolio: PortfolioImage[]; packages: PackageItem[]; testimonials: Testimonial[];
  bookings: Booking[]; audit: AuditEntry[]; onNavigate: (s: Section) => void;
}) {
  const stats = [
    { label: "Portfolio Images", value: portfolio.length, sub: `${portfolio.filter(p => p.featured).length} featured`, Icon: ImageIcon },
    { label: "Packages", value: packages.length, sub: `${packages.filter(p => p.status === "active").length} active`, Icon: Package },
    { label: "Testimonials", value: testimonials.length, sub: `${testimonials.filter(t => t.published).length} published`, Icon: MessageSquare },
    { label: "Total Bookings", value: bookings.length, sub: "all time", Icon: Calendar },
    { label: "Pending", value: bookings.filter(b => b.status === "Pending").length, sub: "awaiting review", Icon: Clock },
    { label: "Confirmed", value: bookings.filter(b => b.status === "Confirmed").length, sub: "this season", Icon: Check },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader title="Dashboard" />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex flex-col gap-6">
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
            {stats.map(({ label, value, sub, Icon }) => (
              <div key={label} className="border border-[#222] rounded p-4 flex flex-col gap-3" style={{ background: "#141414" }}>
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[9px] text-zinc-500 font-semibold tracking-[0.15em] uppercase leading-tight">{label}</span>
                  <Icon size={13} className="text-zinc-700 flex-shrink-0 mt-0.5" />
                </div>
                <div>
                  <div className="text-[2rem] font-bold text-white leading-none" style={{ fontFamily: CONDENSED }}>{value}</div>
                  <div className="text-[10px] text-zinc-600 mt-1">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 280px" }}>
            <SectionCard title="Recent Portfolio">
              <div className="p-4 flex gap-3 overflow-x-auto">
                {portfolio.slice(0, 6).map(img => (
                  <div key={img.id} className="flex-shrink-0 w-36 rounded overflow-hidden border border-[#1E1E1E]" style={{ background: "#0D0D0D" }}>
                    <img src={img.src} alt={img.title} className="w-full h-24 object-cover bg-zinc-900" />
                    <div className="p-2.5">
                      <div className="text-xs text-white font-medium truncate">{img.title}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">{img.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Recent Activity">
              <div className="flex flex-col">
                {audit.slice(0, 7).map((entry, i) => {
                  const s = AUDIT_STYLES[entry.type];
                  return (
                    <div key={entry.id} className={`px-4 py-3 flex items-start gap-3 ${i < 6 ? "border-b border-[#1A1A1A]" : ""}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${s.dot}`} />
                      <div className="min-w-0">
                        <div className="text-xs text-white font-medium truncate leading-snug">{entry.activity}</div>
                        <div className="text-[10px] text-zinc-600 mt-0.5" style={{ fontFamily: MONO }}>{entry.datetime.slice(0, 10)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          <div>
            <div className="text-[10px] text-zinc-600 font-semibold tracking-widest uppercase mb-3">Quick Actions</div>
            <div className="flex gap-3">
              <Btn variant="red" onClick={() => onNavigate("portfolio")}><Plus size={13} />Add Portfolio Image</Btn>
              <Btn onClick={() => onNavigate("packages")}><Plus size={13} />Add Package</Btn>
              <Btn onClick={() => onNavigate("testimonials")}><Plus size={13} />Add Testimonial</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

const emptyImgForm = () => ({ title: "", category: "Lifestyle", date: "", description: "", featured: false });

function PortfolioPage({ portfolio, setPortfolio, addAudit }: {
  portfolio: PortfolioImage[];
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioImage[]>>;
  addAudit: (e: Omit<AuditEntry, "id" | "datetime">) => void;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<PortfolioImage | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleting, setDeleting] = useState<PortfolioImage | null>(null);
  const [form, setForm] = useState(emptyImgForm());
  const [previewUrl, setPreviewUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = portfolio
    .filter(p => category === "All" || p.category === category)
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm(emptyImgForm()); setPreviewUrl(""); setIsAdding(true); };
  const openEdit = (img: PortfolioImage) => {
    setEditing(img);
    setForm({ title: img.title, category: img.category, date: img.date, description: img.description, featured: img.featured });
    setPreviewUrl(img.src);
  };
  const closeForm = () => { setIsAdding(false); setEditing(null); };

  const handleSave = () => {
    if (isAdding) {
      const newImg: PortfolioImage = {
        ...form, id: Date.now(), order: portfolio.length + 1,
        src: previewUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format",
      };
      setPortfolio(prev => [...prev, newImg]);
      addAudit({ activity: "Portfolio Image Added", description: `"${form.title}" added to ${form.category}`, section: "Portfolio", type: "create" });
    } else if (editing) {
      setPortfolio(prev => prev.map(p => p.id === editing.id ? { ...p, ...form, src: previewUrl || p.src } : p));
      addAudit({ activity: "Portfolio Image Edited", description: `"${form.title}" updated`, section: "Portfolio", type: "edit" });
    }
    closeForm();
  };

  const handleDelete = (img: PortfolioImage) => {
    setPortfolio(prev => prev.filter(p => p.id !== img.id));
    addAudit({ activity: "Portfolio Image Deleted", description: `"${img.title}" removed from ${img.category}`, section: "Portfolio", type: "delete", prev: img.title });
  };

  const moveItem = (id: number, dir: -1 | 1) => {
    setPortfolio(prev => {
      const arr = [...prev];
      const i = arr.findIndex(p => p.id === id);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr.map((p, idx) => ({ ...p, order: idx + 1 }));
    });
    addAudit({ activity: "Portfolio Reordered", description: "Portfolio image order updated", section: "Portfolio", type: "edit" });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader title="Portfolio">
        <SearchBar value={search} onChange={setSearch} placeholder="Search images..." />
        <div className="flex border border-[#272727] rounded overflow-hidden">
          {([["grid", LayoutGrid], ["list", List]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-2 transition-colors ${view === v ? "text-white" : "text-zinc-600 hover:text-zinc-400"}`}
              style={{ background: view === v ? "#1A1A1A" : "#0D0D0D" }}>
              <Icon size={14} />
            </button>
          ))}
        </div>
        <Btn variant="red" onClick={openAdd}><Plus size={13} />Add Image</Btn>
      </PageHeader>

      <div className="flex gap-1 px-6 py-3 border-b border-[#1E1E1E] overflow-x-auto flex-shrink-0" style={{ background: "#0A0A0A" }}>
        {CATS.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className="px-3 py-1.5 text-xs rounded font-medium transition-all whitespace-nowrap"
            style={{ background: category === cat ? RED : "transparent", color: category === cat ? "white" : "#666" }}>
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {view === "grid" ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {filtered.map(img => (
              <div key={img.id} className="group relative rounded border border-[#222] overflow-hidden" style={{ background: "#141414" }}>
                <div className="relative bg-zinc-900" style={{ aspectRatio: "4/3" }}>
                  <img src={img.src} alt={img.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2"
                    style={{ background: "rgba(0,0,0,0.65)" }}>
                    <button onClick={() => openEdit(img)} className="p-2 rounded border border-white/10 text-white hover:bg-white/10 transition-colors"><Edit2 size={13} /></button>
                    <button onClick={() => setDeleting(img)} className="p-2 rounded border border-white/10 text-white hover:bg-white/10 transition-colors"><Trash2 size={13} /></button>
                  </div>
                  <div className="absolute top-2 left-2 cursor-grab text-white/30 hover:text-white/60 transition-colors">
                    <GripVertical size={13} />
                  </div>
                  {img.featured && (
                    <div className="absolute top-2 right-2 text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
                      style={{ background: RED, color: "white" }}>
                      Featured
                    </div>
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <div className="text-sm text-white font-medium truncate">{img.title}</div>
                  <div className="text-[10px] text-zinc-600 mt-0.5">{img.category}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <SectionCard>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  {["Image", "Title", "Category", "Date Added", "Order", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[9px] text-zinc-600 font-semibold tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(img => (
                  <tr key={img.id} className="border-b border-[#181818] hover:bg-[#191919] transition-colors">
                    <td className="px-4 py-3">
                      <img src={img.src} alt={img.title} className="w-14 h-9 object-cover rounded bg-zinc-900" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white">{img.title}</div>
                      {img.featured && <span className="text-[9px] text-red-400 font-semibold tracking-widest uppercase">Featured</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{img.category}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500" style={{ fontFamily: MONO }}>{img.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400 w-5 text-center" style={{ fontFamily: MONO }}>{img.order}</span>
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveItem(img.id, -1)} className="text-zinc-600 hover:text-white transition-colors"><ArrowUp size={10} /></button>
                          <button onClick={() => moveItem(img.id, 1)} className="text-zinc-600 hover:text-white transition-colors"><ArrowDown size={10} /></button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(img)} className="p-1.5 text-zinc-600 hover:text-white transition-colors"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleting(img)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                        <GripVertical size={13} className="text-zinc-700 cursor-grab ml-1" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        )}
      </div>

      <Modal open={isAdding || !!editing} onClose={closeForm} title={isAdding ? "Add Image" : "Edit Image"} maxW="520px">
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase block mb-2">Image</label>
            <div className="border-2 border-dashed border-[#2A2A2A] rounded-lg overflow-hidden cursor-pointer hover:border-zinc-600 transition-colors"
              style={{ minHeight: 160 }}
              onClick={() => fileRef.current?.click()}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full object-cover" style={{ maxHeight: 200 }} />
              ) : (
                <div className="flex flex-col items-center gap-3 py-10">
                  <Upload size={18} className="text-zinc-600" />
                  <div className="text-center">
                    <div className="text-sm text-zinc-500">Drop image or click to upload</div>
                    <div className="text-xs text-zinc-700 mt-1">JPG, PNG, WEBP</div>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setPreviewUrl(URL.createObjectURL(f)); }} />
          </div>

          <FInput label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Image title" />

          <FSelect label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATS.filter(c => c !== "All").map(c => <option key={c} value={c} style={{ background: "#141414" }}>{c}</option>)}
          </FSelect>

          <FTextarea label="Description / Caption" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description or caption..." rows={3} />

          <Toggle label="Featured Image" value={form.featured} onChange={v => setForm(f => ({ ...f, featured: v }))} />

          <div className="flex gap-3 pt-3 border-t border-[#222]">
            <Btn onClick={closeForm} className="flex-1 justify-center">Cancel</Btn>
            <Btn variant="red" onClick={handleSave} className="flex-1 justify-center">Save Image</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={() => deleting && handleDelete(deleting)} name={deleting?.title || ""} />
    </div>
  );
}

// ─── Packages ─────────────────────────────────────────────────────────────────

const emptyPkgForm = () => ({ name: "", price: 0, description: "", duration: "", images: 0, features: "", status: "active" as "active" | "inactive" });

function PackagesPage({ packages, setPackages, addAudit }: {
  packages: PackageItem[];
  setPackages: React.Dispatch<React.SetStateAction<PackageItem[]>>;
  addAudit: (e: Omit<AuditEntry, "id" | "datetime">) => void;
}) {
  const [editing, setEditing] = useState<PackageItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleting, setDeleting] = useState<PackageItem | null>(null);
  const [form, setForm] = useState(emptyPkgForm());

  const openAdd = () => { setForm(emptyPkgForm()); setIsAdding(true); };
  const openEdit = (pkg: PackageItem) => {
    setEditing(pkg);
    setForm({ name: pkg.name, price: pkg.price, description: pkg.description, duration: pkg.duration, images: pkg.images, features: pkg.features.join("\n"), status: pkg.status });
  };
  const closeForm = () => { setIsAdding(false); setEditing(null); };

  const handleSave = () => {
    const features = form.features.split("\n").map(f => f.trim()).filter(Boolean);
    if (isAdding) {
      const newPkg: PackageItem = { ...form, id: Date.now(), features };
      setPackages(prev => [...prev, newPkg]);
      addAudit({ activity: "Package Added", description: `"${form.name}" created at $${form.price}`, section: "Packages", type: "create" });
    } else if (editing) {
      setPackages(prev => prev.map(p => p.id === editing.id ? { ...p, ...form, features } : p));
      addAudit({ activity: "Package Edited", description: `"${form.name}" updated`, section: "Packages", type: "edit" });
    }
    closeForm();
  };

  const handleDelete = (pkg: PackageItem) => {
    setPackages(prev => prev.filter(p => p.id !== pkg.id));
    addAudit({ activity: "Package Deleted", description: `"${pkg.name}" package removed`, section: "Packages", type: "delete" });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader title="Packages">
        <Btn variant="red" onClick={openAdd}><Plus size={13} />Add Package</Btn>
      </PageHeader>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {packages.map(pkg => (
            <div key={pkg.id} className="border border-[#222] rounded p-5 flex flex-col gap-4" style={{ background: "#141414" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-white" style={{ fontFamily: CONDENSED, fontSize: "1.15rem", letterSpacing: "0.04em" }}>
                      {pkg.name}
                    </span>
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${pkg.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"}`}>
                      {pkg.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{pkg.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-white" style={{ fontFamily: CONDENSED }}>
                    ${pkg.price.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div>
                  <div className="text-[9px] text-zinc-600 tracking-widest uppercase font-semibold">Duration</div>
                  <div className="text-xs text-zinc-300 mt-0.5">{pkg.duration}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-600 tracking-widest uppercase font-semibold">Images</div>
                  <div className="text-xs text-zinc-300 mt-0.5">{pkg.images} edited</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {pkg.features.map(f => (
                  <span key={f} className="text-[10px] text-zinc-500 border border-[#2A2A2A] px-2 py-0.5 rounded">{f}</span>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#1E1E1E]">
                <Btn size="xs" onClick={() => openEdit(pkg)}><Edit2 size={11} />Edit</Btn>
                <Btn size="xs" variant="destructive" onClick={() => setDeleting(pkg)}><Trash2 size={11} />Delete</Btn>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={isAdding || !!editing} onClose={closeForm} title={isAdding ? "Add Package" : "Edit Package"} maxW="480px">
        <div className="flex flex-col gap-5">
          <FInput label="Package Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Wedding Day" />
          <div className="grid grid-cols-2 gap-4">
            <FInput label="Price ($)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} placeholder="0" />
            <FInput label="Duration" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 4 hours" />
          </div>
          <FInput label="Edited Images" type="number" value={form.images} onChange={e => setForm(f => ({ ...f, images: Number(e.target.value) }))} placeholder="0" />
          <FTextarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Package description..." />
          <FTextarea label="Features (one per line)" value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={5} placeholder={"Online gallery\nHigh-res downloads\nBasic retouching"} />
          <FSelect label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as "active" | "inactive" }))}>
            <option value="active" style={{ background: "#141414" }}>Active</option>
            <option value="inactive" style={{ background: "#141414" }}>Inactive</option>
          </FSelect>
          <div className="flex gap-3 pt-3 border-t border-[#222]">
            <Btn onClick={closeForm} className="flex-1 justify-center">Cancel</Btn>
            <Btn variant="red" onClick={handleSave} className="flex-1 justify-center">Save Package</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={() => deleting && handleDelete(deleting)} name={deleting?.name || ""} />
    </div>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const emptyTestiForm = () => ({ client: "", avatar: "", text: "", rating: 5, date: "", published: false });

function TestimonialsPage({ testimonials, setTestimonials, addAudit }: {
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  addAudit: (e: Omit<AuditEntry, "id" | "datetime">) => void;
}) {
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyTestiForm());

  const openAdd = () => { setForm(emptyTestiForm()); setIsAdding(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setForm({ client: t.client, avatar: t.avatar, text: t.text, rating: t.rating, date: t.date, published: t.published }); };
  const closeForm = () => { setIsAdding(false); setEditing(null); };

  const handleSave = () => {
    if (isAdding) {
      setTestimonials(prev => [...prev, { ...form, id: Date.now() }]);
      addAudit({ activity: "Testimonial Added", description: `New testimonial from ${form.client}`, section: "Testimonials", type: "create" });
    } else if (editing) {
      setTestimonials(prev => prev.map(t => t.id === editing.id ? { ...t, ...form } : t));
      addAudit({ activity: "Testimonial Edited", description: `${form.client}'s testimonial updated`, section: "Testimonials", type: "edit" });
    }
    closeForm();
  };

  const handleDelete = (t: Testimonial) => {
    setTestimonials(prev => prev.filter(x => x.id !== t.id));
    addAudit({ activity: "Testimonial Deleted", description: `${t.client}'s testimonial removed`, section: "Testimonials", type: "delete" });
  };

  const togglePublish = (t: Testimonial) => {
    setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, published: !x.published } : x));
    addAudit({ activity: "Testimonial Publication Changed", description: `${t.client}'s testimonial ${t.published ? "unpublished" : "published"}`, section: "Testimonials", type: "edit", prev: t.published ? "Published" : "Unpublished", next: t.published ? "Unpublished" : "Published" });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader title="Testimonials">
        <Btn variant="red" onClick={openAdd}><Plus size={13} />Add Testimonial</Btn>
      </PageHeader>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
          {testimonials.map(t => (
            <div key={t.id} className="border border-[#222] rounded p-5 flex flex-col gap-4" style={{ background: "#141414" }}>
              <div className="flex items-start gap-3.5">
                <img src={t.avatar} alt={t.client} className="w-10 h-10 rounded-full object-cover bg-zinc-800 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{t.client}</span>
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${t.published ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"}`}>
                      {t.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <StarDisplay rating={t.rating} />
                    <span className="text-[10px] text-zinc-600" style={{ fontFamily: MONO }}>{t.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed italic">"{t.text}"</p>
              <div className="flex gap-2 pt-3 border-t border-[#1E1E1E]">
                <Btn size="xs" onClick={() => togglePublish(t)}>
                  {t.published ? <EyeOff size={11} /> : <Eye size={11} />}
                  {t.published ? "Unpublish" : "Publish"}
                </Btn>
                <Btn size="xs" onClick={() => openEdit(t)}><Edit2 size={11} />Edit</Btn>
                <Btn size="xs" variant="destructive" onClick={() => setDeleting(t)}><Trash2 size={11} />Delete</Btn>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={isAdding || !!editing} onClose={closeForm} title={isAdding ? "Add Testimonial" : "Edit Testimonial"} maxW="480px">
        <div className="flex flex-col gap-5">
          <FInput label="Client Name" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} placeholder="Client full name" />
          <FInput label="Client Photo URL" value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} placeholder="https://..." />
          <FTextarea label="Testimonial" value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} rows={4} placeholder="What the client said..." />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">Rating</label>
            <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
          </div>
          <FInput label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Toggle label="Published" value={form.published} onChange={v => setForm(f => ({ ...f, published: v }))} />
          <div className="flex gap-3 pt-3 border-t border-[#222]">
            <Btn onClick={closeForm} className="flex-1 justify-center">Cancel</Btn>
            <Btn variant="red" onClick={handleSave} className="flex-1 justify-center">Save Testimonial</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={() => deleting && handleDelete(deleting)} name={deleting?.client || ""} />
    </div>
  );
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

function BookingsPage({ bookings, setBookings, addAudit }: {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  addAudit: (e: Omit<AuditEntry, "id" | "datetime">) => void;
}) {
  const changeStatus = (id: number, prev: BookingStatus, next: BookingStatus) => {
    if (prev === next) return;
    setBookings(b => b.map(bk => bk.id === id ? { ...bk, status: next } : bk));
    const bk = bookings.find(b => b.id === id);
    addAudit({ activity: "Booking Status Changed", description: `${bk?.client} booking updated`, section: "Bookings", type: "status", prev, next });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader title="Bookings" />
      <div className="flex-1 overflow-y-auto p-6">
        <SectionCard>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                {["Client", "Contact", "Package", "Preferred Date", "Request Date", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[9px] text-zinc-600 font-semibold tracking-widest uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(bk => (
                <tr key={bk.id} className="border-b border-[#181818] hover:bg-[#191919] transition-colors">
                  <td className="px-5 py-4">
                    <div className="text-sm text-white font-medium">{bk.client}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-zinc-400">{bk.email}</div>
                    <div className="text-xs text-zinc-600 mt-0.5">{bk.phone}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-300">{bk.package}</td>
                  <td className="px-5 py-4 text-xs text-zinc-400" style={{ fontFamily: MONO }}>{bk.preferredDate}</td>
                  <td className="px-5 py-4 text-xs text-zinc-500" style={{ fontFamily: MONO }}>{bk.requestDate}</td>
                  <td className="px-5 py-4">
                    <select
                      value={bk.status}
                      onChange={e => changeStatus(bk.id, bk.status, e.target.value as BookingStatus)}
                      className={`text-xs font-semibold border rounded px-2.5 py-1.5 outline-none cursor-pointer transition-colors ${BOOKING_STYLES[bk.status]}`}
                      style={{ background: "transparent" }}>
                      {(["Pending", "To Confirm", "Confirmed"] as BookingStatus[]).map(s => (
                        <option key={s} value={s} style={{ background: "#141414", color: "#F2F2F2" }}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Audit Trail ──────────────────────────────────────────────────────────────

function AuditTrailPage({ audit }: { audit: AuditEntry[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const filtered = audit
    .filter(e => typeFilter === "All" || e.type === typeFilter)
    .filter(e =>
      e.activity.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.section.toLowerCase().includes(search.toLowerCase())
    );

  const auditTypes: (AuditType | "All")[] = ["All", "create", "edit", "delete", "login", "logout", "status", "settings"];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader title="Audit Trail">
        <SearchBar value={search} onChange={setSearch} placeholder="Search activity..." />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs text-zinc-300 border border-[#272727] rounded outline-none focus:border-zinc-500"
          style={{ background: "#0D0D0D" }}>
          {auditTypes.map(t => (
            <option key={t} value={t} style={{ background: "#0D0D0D" }}>
              {t === "All" ? "All Types" : (AUDIT_STYLES[t as AuditType]?.label || t)}
            </option>
          ))}
        </select>
      </PageHeader>

      <div className="px-7 py-2.5 border-b border-[#1A1A1A] flex-shrink-0" style={{ background: "#0A0A0A" }}>
        <p className="text-xs text-zinc-600">Track recent activity and changes made within the dashboard.</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <SectionCard>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  {["Date & Time", "Activity", "Description", "Section", "Type"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[9px] text-zinc-600 font-semibold tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => {
                  const s = AUDIT_STYLES[entry.type];
                  const isSel = selected?.id === entry.id;
                  return (
                    <tr key={entry.id}
                      className={`border-b border-[#181818] cursor-pointer transition-colors ${isSel ? "bg-[#1C1C1C]" : "hover:bg-[#181818]"}`}
                      onClick={() => setSelected(isSel ? null : entry)}>
                      <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap" style={{ fontFamily: MONO }}>
                        {entry.datetime}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{entry.activity}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400 max-w-xs">{entry.description}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{entry.section}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                          <span className={`text-xs ${s.text}`}>{s.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
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
          <div className="w-72 flex-shrink-0 border-l border-[#1E1E1E] flex flex-col" style={{ background: "#0D0D0D" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white" style={{ fontFamily: CONDENSED }}>Activity Detail</span>
              <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-white transition-colors p-0.5"><X size={13} /></button>
            </div>
            <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1">
              {([
                { label: "Timestamp", value: selected.datetime },
                { label: "Activity", value: selected.activity },
                { label: "Description", value: selected.description },
                { label: "Section", value: selected.section },
              ] as const).map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[9px] text-zinc-600 font-semibold tracking-widest uppercase mb-1">{label}</div>
                  <div className="text-xs text-zinc-300 leading-relaxed">{value}</div>
                </div>
              ))}

              {(selected.prev || selected.next) && (
                <div className="border-t border-[#222] pt-4 flex flex-col gap-3">
                  <div className="text-[9px] text-zinc-600 font-semibold tracking-widest uppercase">Changes</div>
                  {selected.prev && (
                    <div>
                      <div className="text-[9px] text-zinc-600 mb-1.5">Previous Value</div>
                      <div className="text-xs text-red-400 px-2.5 py-2 rounded border border-red-500/20 leading-relaxed"
                        style={{ background: "rgba(229,9,20,0.06)" }}>{selected.prev}</div>
                    </div>
                  )}
                  {selected.next && (
                    <div>
                      <div className="text-[9px] text-zinc-600 mb-1.5">New Value</div>
                      <div className="text-xs text-emerald-400 px-2.5 py-2 rounded border border-emerald-500/20 leading-relaxed"
                        style={{ background: "rgba(5,150,105,0.06)" }}>{selected.next}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <div className={`w-2 h-2 rounded-full ${AUDIT_STYLES[selected.type].dot}`} />
                <span className={`text-xs font-medium ${AUDIT_STYLES[selected.type].text}`}>
                  {AUDIT_STYLES[selected.type].label}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsPage({ addAudit }: { addAudit: (e: Omit<AuditEntry, "id" | "datetime">) => void }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    studioName: "Lens Studio",
    email: "hello@lensstudio.com",
    phone: "+1 555 0100",
    location: "New York, NY",
    instagram: "@lensstudio",
    bookingMessage: "Thank you for your inquiry. We will get back to you within 24 hours.",
    maxBookings: "10",
  });

  const handleSave = () => {
    addAudit({ activity: "Settings Updated", description: "Studio settings saved", section: "Settings", type: "settings" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader title="Settings" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-5" style={{ maxWidth: 520 }}>
          <SectionCard title="Studio Information">
            <div className="p-5 flex flex-col gap-4">
              <FInput label="Studio Name" value={form.studioName} onChange={e => setForm(f => ({ ...f, studioName: e.target.value }))} />
              <FInput label="Contact Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <FInput label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <FInput label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              <FInput label="Instagram Handle" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
            </div>
          </SectionCard>

          <SectionCard title="Booking Settings">
            <div className="p-5 flex flex-col gap-4">
              <FTextarea label="Auto-reply Message" value={form.bookingMessage}
                onChange={e => setForm(f => ({ ...f, bookingMessage: e.target.value }))} rows={4} />
              <FInput label="Max Concurrent Bookings" type="number" value={form.maxBookings}
                onChange={e => setForm(f => ({ ...f, maxBookings: e.target.value }))} />
            </div>
          </SectionCard>

          <div>
            <Btn variant="red" onClick={handleSave} className="min-w-[140px] justify-center">
              {saved ? <><Check size={13} />Saved</> : "Save Changes"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [section, setSection] = useState<Section>("dashboard");
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>(PORTFOLIO_DATA);
  const [packages, setPackages] = useState<PackageItem[]>(PACKAGES_DATA);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS_DATA);
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS_DATA);
  const [audit, setAudit] = useState<AuditEntry[]>(AUDIT_DATA);

  const addAudit = (entry: Omit<AuditEntry, "id" | "datetime">) => {
    setAudit(prev => [{
      ...entry, id: Date.now(),
      datetime: new Date().toISOString().replace("T", " ").slice(0, 19),
    }, ...prev]);
  };

  return (
    <>
      <style>{`
        * { font-family: 'Outfit', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #3A3A3A; }
      `}</style>
      <div className="flex h-screen overflow-hidden" style={{ background: "#080808", color: "#F2F2F2" }}>
        <Sidebar active={section} onNavigate={setSection} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {section === "dashboard" && (
            <DashboardPage portfolio={portfolio} packages={packages} testimonials={testimonials}
              bookings={bookings} audit={audit} onNavigate={setSection} />
          )}
          {section === "portfolio" && (
            <PortfolioPage portfolio={portfolio} setPortfolio={setPortfolio} addAudit={addAudit} />
          )}
          {section === "packages" && (
            <PackagesPage packages={packages} setPackages={setPackages} addAudit={addAudit} />
          )}
          {section === "testimonials" && (
            <TestimonialsPage testimonials={testimonials} setTestimonials={setTestimonials} addAudit={addAudit} />
          )}
          {section === "bookings" && (
            <BookingsPage bookings={bookings} setBookings={setBookings} addAudit={addAudit} />
          )}
          {section === "trail" && <AuditTrailPage audit={audit} />}
          {section === "settings" && <SettingsPage addAudit={addAudit} />}
        </div>
      </div>
    </>
  );
}
