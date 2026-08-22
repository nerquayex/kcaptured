import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KCAPTURED Studios Admin',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#090909] text-[#f2f2f2]">{children}</div>
}
