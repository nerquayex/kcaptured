import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export const metadata: Metadata = {
  title: 'KCAPTURED - Professional Photography | Lifestyle & Studio',
  description: 'Premium photography services specializing in authentic lifestyle and professional studio portraits. Capturing beautiful moments that tell your story.',
  keywords: ['photography', 'lifestyle photography', 'studio photography', 'professional portraits', 'photographer'],
  authors: [{ name: 'KCAPTURED' }],
  creator: 'KCAPTURED',
  publisher: 'KCAPTURED',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'KCAPTURED - Professional Photography',
    description: 'Premium lifestyle and studio photography services',
    url: 'https://kcaptured.com',
    siteName: 'KCAPTURED',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773348310/35-2W1A0773__2_jjv1ug.jpg',
        width: 1200,
        height: 630,
        alt: 'KCAPTURED Photography',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KCAPTURED - Professional Photography',
    description: 'Premium lifestyle and studio photography services',
    creator: '@kcaptured',
    images: ['https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773348310/35-2W1A0773__2_jjv1ug.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-white dark:bg-black text-gray-900 dark:text-white">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
