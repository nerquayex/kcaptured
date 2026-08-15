'use client'

import { PortfolioAdmin } from '@/components/admin/portfolio-admin'

export default function AdminPortfolioPage() {
  return (
    <div className="py-6">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.35em] text-primary">Portfolio</p>
        <h1 className="mt-3 text-3xl font-semibold">Manage your photography portfolio</h1>
        <p className="mt-2 text-gray-300">Use this interface to view, upload, edit, toggle, delete and reorder portfolio items.</p>
      </div>
      <PortfolioAdmin />
    </div>
  )
}
