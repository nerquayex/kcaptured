'use client'

import { PackagesAdmin } from '@/components/admin/packages-admin'

export default function AdminPackagesPage() {
  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">Packages</p>
          <h1 className="mt-3 text-3xl font-semibold">Manage your photography packages and pricing.</h1>
          <p className="mt-2 text-gray-300">Edit packages stored in the database or add new offerings.</p>
        </div>
        <PackagesAdmin />
      </div>
    </div>
  )
}
