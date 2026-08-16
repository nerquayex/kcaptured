-- Create site_settings table (idempotent)
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  business_name TEXT DEFAULT 'KCAPTURED',
  email TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  cash_app TEXT,
  zelle_email TEXT,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert default record if not exists
INSERT INTO site_settings (id, business_name, email, instagram_url, tiktok_url, cash_app, zelle_email, updated_at)
VALUES (
  'default',
  'KCAPTURED',
  'kenny.stevens13@hotmail.com',
  'https://www.instagram.com/kcaptures_.1',
  'https://www.tiktok.com/@kcaptured_',
  '$Kenstevens2',
  'kenny.stevens13@hotmail.com',
  NOW()
)
ON CONFLICT (id) DO NOTHING;
