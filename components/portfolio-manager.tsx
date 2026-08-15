import React from 'react'

export interface PortfolioImage {
  id: string
  cloudinaryUrl: string
  category?: string
  title?: string
}

export function PortfolioManager({ images }: { images?: PortfolioImage[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-300">
      <p className="font-semibold">Portfolio manager (placeholder)</p>
      <p className="mt-2 text-sm">The admin portfolio UI has been moved to the new admin dashboard. This component will be restored in a later step.</p>
    </div>
  )
}
