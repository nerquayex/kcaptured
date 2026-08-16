-- Drizzle initial migration: create portfolio_items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id TEXT PRIMARY KEY,
  public_id TEXT NOT NULL,
  cloudinary_url TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_active ON public.portfolio_items (active);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_sort_order ON public.portfolio_items (sort_order);
