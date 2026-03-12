# KCAPTURED - Professional Photography Portfolio

A modern, high-performance photography portfolio website built with Next.js 15, React 19, Tailwind CSS, and Framer Motion. Features a masonry-style gallery, blog, FAQ section, testimonial videos, and contact form integration.

## Features Implemented ✅

### Core Pages
- ✅ **Homepage** - Hero section with background image, services showcase, testimonials carousel, contact CTA
- ✅ **Portfolio Gallery** - Pinterest-style masonry layout with category filtering (Lifestyle/Studio)
- ✅ **Blog** - Listing page and individual article pages with metadata
- ✅ **FAQ** - Accordion-style questions organized by category
- ✅ **Contact Form** - Formspree email integration with validation
- ✅ **Responsive Navigation** - Sticky header with mobile menu and theme toggle

### Design & Experience
- ✅ **Dark/Light Theme** - Automatic system detection with manual toggle
- ✅ **Smooth Animations** - Framer Motion animations throughout (fade-in, scale, transitions)
- ✅ **Blurred Background Sections** - Services and testimonials sections feature blurred background images with 75% dark overlay
- ✅ **Video Testimonials** - Client testimonial videos with proper aspect ratio (aspect-video, 16:9)
- ✅ **Minimalist Design** - Clean black and white color scheme matching client brand

### Performance & SEO
- ✅ **Image Caching** - 365-day cache for Cloudinary images via Next.js Image Optimization
- ✅ **Metadata** - Comprehensive Open Graph, Twitter Card, and structured data
- ✅ **Sitemap** - Auto-generated XML sitemap with all pages and blog posts
- ✅ **Robots.txt** - Search engine crawling configuration
- ✅ **Response Optimization** - Next.js automatic image optimization with WebP/AVIF formats

## Features To Add (Future Enhancements)

- [ ] Admin Dashboard - Manage content without code changes
- [ ] Database Integration - Store blog posts, testimonials, and contact submissions
- [ ] Booking System - Schedule sessions directly from website
- [ ] Newsletter Signup - Email list collection
- [ ] Analytics Integration - Track visitor behavior and conversions
- [ ] Advanced SEO - Schema markup for Organization, LocalBusiness
- [ ] Multi-language Support - i18n for international clients
- [ ] Video Gallery Section - Showcase video reels and behind-the-scenes
- [ ] E-commerce Integration - Sell prints or digital files
- [ ] Image Search - Advanced filtering and search by tags

## Getting Started

### Installation

1. **Clone or download the project**

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set environment variables (optional):**
   Create `.env.local` file:
   ```
   NEXT_PUBLIC_BASE_URL=https://kcaptured.com
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dq4tkpuu4
   ```

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

5. **Open in browser:**
   Visit `http://localhost:3000`

## Configuration

### Branding & Logo Setup

#### Logo Placement
1. **Main Logo** - Place logo image at `/public/images/logo.png`
2. **Update Header** - Edit `components/header.tsx`:
   ```tsx
   <Link href="/" className="...">
     <Image 
       src="/images/logo.png" 
       alt="KCAPTURED" 
       width={180} 
       height={40}
     />
   </Link>
   ```

#### Favicon Setup
1. **Favicon Files** - Add to `/public/`:
   - `favicon.ico` - Browser tab icon (32x32 or 64x64)
   - `apple-icon.png` - Apple devices (180x180)
2. **Already configured** in `app/layout.tsx` metadata

#### Social Media Share Image
1. **Share Image** - Place at `/public/og-image.png` (1200x630 pixels)
2. **Update in** `app/layout.tsx` if using different image:
   ```tsx
   images: [{
     url: '/og-image.png',
     width: 1200,
     height: 630,
   }]
   ```

### Cloudinary Media Management

All images and videos come from Cloudinary. Your cloud name is: `dq4tkpuu4`

#### Portfolio Images Setup
**File:** `lib/portfolio-data.ts`

Portfolio images display in a masonry (Pinterest-style) layout on the Portfolio page. Filter buttons allow visitors to view:
- All Work
- Lifestyle (casual, natural setting photos)
- Studio (controlled environment, lit photography)

```typescript
{
  id: 'lifestyle-1',
  cloudinaryUrl: 'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773348315/FILENAME.jpg',
  category: 'lifestyle',  // or 'studio'
  title: 'Image Title',
  description: 'Optional description',
  width: 400,   // Original image width
  height: 600,  // Original image height
}
```

**Important:** Accurate width/height values ensure proper masonry layout proportions.

#### Testimonial Videos Setup
**File:** `lib/testimonials-data.ts`

Client testimonial videos display in the testimonials carousel on the homepage. Videos are formatted as:
- Format: MP4, MOV, or WebM
- Maximum size: 50MB recommended
- Aspect ratio: 16:9 (landscape)

```typescript
{
  id: 'testimonial-1',
  clientName: 'Client Name',
  clientRole: 'Session Type',
  content: 'Their testimonial quote',
  videoUrl: 'https://res.cloudinary.com/dq4tkpuu4/video/upload/v1773351713/FILENAME.mov',
  imageUrl: 'https://via.placeholder.com/100x100',
}
```

#### Background Images
**Services & Testimonials sections** use this blurred background:
`https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773348310/35-2W1A0773__2_jjv1ug.jpg`

To change it, edit:
- `components/services-section.tsx` (line 40)
- `components/testimonials-section.tsx` (line 27)

#### Hero Section Image
**File:** `components/hero-section.tsx`

Update the background image URL (line 32):
```tsx
backgroundImage: 'url(https://res.cloudinary.com/dq4tkpuu4/image/upload/FILENAME)',
```

### Content Configuration

#### Services/Packages
**File:** `lib/services-data.ts`

Update your service offerings:
```typescript
{
  id: 'lifestyle-basic',
  category: 'lifestyle',  // or 'studio'
  name: 'Service Name',
  duration: '30 min',
  price: 70,
  features: ['Feature 1', 'Feature 2'],
}
```

#### Blog Posts
**File:** `lib/blog-data.ts`

Create new blog posts for photography tips and insights:
```typescript
{
  id: 'post-slug',
  slug: 'post-slug',
  title: 'Blog Post Title',
  excerpt: 'Short preview text',
  content: 'Full HTML or markdown content',
  author: 'Your Name',
  category: 'Tips',
  publishedDate: '2026-03-12',
  readTime: 5,
}
```

#### FAQ Items
**File:** `lib/faq-data.ts`

Add frequently asked questions:
```typescript
{
  id: 'faq-1',
  question: 'Your question?',
  answer: 'Detailed answer here',
  category: 'Booking',  // or 'Policies', 'Timeline', 'Technical'
}
```

### Instagram Handle & Links
Update your Instagram handle in:
1. `components/hero-section.tsx` - "Book Now on Instagram" button
2. `components/footer.tsx` - Footer social links
3. Replace `https://instagram.com/your_handle` with your actual profile

Search for `your_handle` in the codebase to find all locations.

### Email Setup (Contact Form)
The contact form uses Formspree for email delivery.

1. **Get Form ID:**
   - Go to [formspree.io](https://formspree.io)
   - Create new form or use existing
   - Copy your Form ID

2. **Update Contact Form:**
   - Edit `components/contact-form.tsx`
   - Replace `YOUR_FORM_ID` with your actual ID (line 75)

## Performance Optimization

### Image Caching
Images are cached for **365 days** (1 year) to ensure fast repeat visits:

```javascript
// Configured in next.config.mjs
images: {
  minimumCacheTTL: 31536000,  // 1 year in seconds
  formats: ['image/avif', 'image/webp'],
}
```

Cloudinary images automatically receive:
- WebP/AVIF format conversion for modern browsers
- Responsive image sizes via srcSet
- Lazy loading on scroll

### What's Cached
- ✅ Cloudinary images (portfolio, testimonial backgrounds)
- ✅ Static assets (logos, icons, fonts)
- ✅ Next.js optimized images
- ✅ CSS and JavaScript bundles

## Recent Fixes (v1.2)

- ✅ Fixed background images visibility (removed conflicting solid color, added proper overlay)
- ✅ Fixed testimonial video sizing (aspect-video with max-width)
- ✅ Fixed gallery filtering - content now displays correctly when switching categories
- ✅ Fixed services filtering - animation properly handles category changes
- ✅ Updated branding to "KCAPTURED" throughout site
- ✅ Added comprehensive metadata for SEO
- ✅ Generated sitemap and robots.txt
- ✅ Implemented image caching strategy
- ✅ Gallery image labels hidden from display
- ✅ Videos properly constrained in testimonials carousel

## File Structure

```
/app
  /layout.tsx           - Root layout with metadata
  /page.tsx             - Homepage
  /sitemap.ts           - XML sitemap generation
  /robots.ts            - Robots.txt configuration
  /portfolio
    /page.tsx           - Portfolio gallery page
  /blog
    /page.tsx           - Blog listing
    /[slug]/page.tsx    - Individual blog post
  /faq
    /page.tsx           - FAQ page
  /globals.css          - Global styles

/components
  /header.tsx           - Navigation header with logo
  /hero-section.tsx     - Homepage hero
  /services-section.tsx - Services with blurred background
  /testimonials-section.tsx - Video testimonials carousel
  /masonry-gallery.tsx  - Pinterest-style gallery
  /blog-post-card.tsx   - Blog preview card
  /faq-accordion.tsx    - FAQ accordion
  /contact-form.tsx     - Formspree contact form
  /footer.tsx           - Site footer
  /theme-toggle.tsx     - Dark/light mode toggle

/lib
  /portfolio-data.ts    - Portfolio images (add your images here)
  /services-data.ts     - Service packages
  /testimonials-data.ts - Client testimonials (add videos here)
  /blog-data.ts         - Blog posts
  /faq-data.ts          - FAQ items

/public
  /images/
    /logo.png           - Add your logo here
  /favicon.ico          - Browser tab icon
  /apple-icon.png       - Apple device icon
  /og-image.png         - Social media share image
```

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update portfolio content"
   git push origin main
   ```

2. **Deploy:**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Deploy with one click
   - Environment variables auto-configured

3. **Custom Domain:**
   - Add domain in Vercel project settings
   - DNS configured automatically

### Environment Variables

For production, set these in Vercel:
```
NEXT_PUBLIC_BASE_URL=https://kcaptured.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dq4tkpuu4
```

## Troubleshooting

### Gallery filtering not showing content
- Ensure `AnimatePresence` mode is set to `popLayout` in masonry-gallery.tsx
- Check browser console for animation errors

### Videos not playing
- Verify video URLs are correct in testimonials-data.ts
- Check video format is supported (MP4, MOV, WebM)
- Ensure videos are under 50MB

### Images not loading
- Verify Cloudinary URLs are correct
- Check image exists in your Cloudinary account
- Verify image width/height in portfolio-data.ts

### Contact form not sending emails
- Verify Formspree Form ID in contact-form.tsx
- Check email configuration in Formspree dashboard
- Test form submission in browser console

## Support & Updates

For issues or updates:
1. Check documentation files (README.md, UPDATES.md, CLOUDINARY_SETUP.md)
2. Review Vercel deployment logs
3. Test in browser DevTools console
4. Check Cloudinary media library for image/video status

## Technology Stack

- **Framework:** Next.js 15
- **React:** React 19.2
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion 11
- **Icons:** Lucide React
- **Media:** Cloudinary (CDN)
- **Email:** Formspree
- **Analytics:** Vercel Analytics
- **Deployment:** Vercel

## License

Professional photography portfolio template. All photos are your own intellectual property.
