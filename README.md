# Photography Portfolio Website

A modern, professional photography portfolio website built with Next.js 15, React 19, and Tailwind CSS. Features a masonry-style gallery, blog, FAQ section, and contact form integration.

## Overview

This website is designed specifically for lifestyle and studio photographers. It includes:

- **Homepage** with hero section, service packages, and client testimonials
- **Portfolio Gallery** with masonry layout and category filtering
- **Blog** section for photography tips and insights
- **FAQ** page with common questions organized by category
- **Contact Form** integrated with Formspree
- **Responsive Design** that works on all devices
- **Data-Driven Architecture** for easy content updates

All portfolio images and testimonial videos are loaded from Cloudinary, making it easy to update your work without code changes.

## Getting Started

### Installation

1. **Clone or download the project**

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Open in browser:**
   Visit `http://localhost:3000`

## Configuration

### Cloudinary Setup

All images and videos are served through Cloudinary. Follow these steps to set it up:

1. **Sign up for Cloudinary** at [cloudinary.com](https://cloudinary.com) (free tier available)

2. **Get your Cloud Name:**
   - Go to your Cloudinary Dashboard
   - Copy your "Cloud Name" (you'll need this for all URLs)

### Where to Add Media Files

#### Portfolio/Gallery Images
**File:** `lib/portfolio-data.ts`

Add or update your portfolio images here. The site will display them in a Pinterest-style masonry layout with filtering by category (Lifestyle or Studio).

```typescript
{
  id: 'lifestyle-1',
  cloudinaryUrl: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/lifestyle-portrait.jpg',
  category: 'lifestyle',  // or 'studio'
  title: 'Sunset Portrait Session',
  description: 'Optional description of the image',
  width: 300,   // Original image width - important for masonry layout
  height: 400,  // Original image height - important for masonry layout
}
```

**Important:** Always provide accurate width/height of your images so the masonry layout calculates proportions correctly.

#### Hero/Background Images
**File:** You can add a hero image URL in `components/hero-section.tsx` by adding a background image style:
```tsx
<section className="... bg-cover bg-center" style={{backgroundImage: 'url(YOUR_CLOUDINARY_URL)'}}>
```

#### Testimonial Videos
**File:** `lib/testimonials-data.ts`

This section displays video testimonials from your clients. Videos can be in .mp4, .mov, or WebM format.

```typescript
{
  id: 'testimonial-1',
  clientName: 'Sarah Johnson',
  clientRole: 'Brand Owner',
  content: 'The photos were amazing!',
  videoUrl: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1234567890/testimonial-sarah.mp4',
  imageUrl: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/sarah-photo.jpg',  // Client photo
}
```

#### Blog Post Featured Images (Optional)
**File:** `lib/blog-data.ts`

You can add featured image URLs to blog posts:
```typescript
{
  id: 'post-1',
  title: 'Photography Tips',
  // ... other fields
  featuredImage: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/blog-featured.jpg',
}
```

Then display it in `app/blog/[slug]/page.tsx` if desired.

### Formspree Contact Form Setup

The contact form is integrated with Formspree for form submissions:

1. **Sign up at** [formspree.io](https://formspree.io)

2. **Create a new form** in Formspree dashboard

3. **Copy your Form ID** (format: `f/xxxxxxxxxxxx`)

4. **Update the form endpoint:**
   - Edit `components/contact-form.tsx`
   - Replace `YOUR_FORM_ID` in this line:
     ```typescript
     const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
     ```

5. **Test the form** by submitting a message

### Instagram Handle Setup

Replace the placeholder Instagram handle in multiple places with your actual handle:

**Search for:** `https://instagram.com/your_handle` and `@your_handle`

**Update in:**
1. **Hero Section** (`components/hero-section.tsx`) - "Book Now on Instagram" button
2. **Footer** (`components/footer.tsx`) - Instagram link in footer
3. **Header** (`components/header.tsx`) - If you add Instagram to navigation

Example change:
```tsx
// Before:
href="https://instagram.com/your_handle"

// After:
href="https://instagram.com/your_actual_instagram_handle"
```

## Content Updates

### Portfolio Images

To add or update portfolio images:

1. **Upload images to Cloudinary:**
   - Go to Cloudinary dashboard
   - Upload your image
   - Copy the public URL

2. **Update `lib/portfolio-data.ts`:**
   ```typescript
   {
     id: 'unique-id',
     cloudinaryUrl: 'https://res.cloudinary.com/.../your-image.jpg',
     category: 'lifestyle' | 'studio',
     title: 'Your Image Title',
     description: 'Optional description',
     width: 300,  // Image width in pixels
     height: 400, // Image height in pixels
   }
   ```

   **Important:** Provide accurate width/height for the masonry layout to work properly.

### Services

**File:** `lib/services-data.ts`

Services are organized by category (Lifestyle and Studio) with duration and pricing. The homepage displays all services with a filter button to toggle between categories.

```typescript
{
  id: 'lifestyle-basic',
  category: 'lifestyle',  // or 'studio'
  name: 'Basic Lifestyle Shoot',
  duration: '30 min',
  price: 70,  // Numeric price - will display as $70
  features: [
    '30 minute session',
    'Natural settings',
    'Digital delivery',
    'Edited photos',
  ],
}
```

**Current services included:**
- **Lifestyle:** Basic ($70/30min), Deluxe ($150/1hr), Premium ($200/1.5hr)
- **Studio:** Basic ($170/1hr), Deluxe ($220/1.5hr), Premium ($300/2hr)

You can edit these directly in the data file and add new service packages as needed.

### Testimonials

Update testimonials in `lib/testimonials-data.ts`:

```typescript
{
  id: 'unique-id',
  clientName: 'Client Name',
  clientRole: 'Their role/title',
  content: 'What they said about your work',
  videoUrl: 'Cloudinary video URL (optional)',
  imageUrl: 'Client photo URL (optional)',
}
```

### Blog Posts

Update blog posts in `lib/blog-data.ts`:

```typescript
{
  id: 'unique-id',
  title: 'Post Title',
  excerpt: 'Short summary for preview',
  content: 'Full post content (paragraphs separated by double line breaks)',
  author: 'Author Name',
  publishedDate: 'YYYY-MM-DD',
  readTime: 5, // estimated minutes
  category: 'Techniques',
  slug: 'url-friendly-slug',
}
```

Blog posts are automatically available at `/blog` (listing) and `/blog/[slug]` (individual post).

### FAQ Items

Update FAQ items in `lib/faq-data.ts`:

```typescript
{
  id: 'unique-id',
  question: 'Your question?',
  answer: 'Detailed answer to the question',
  category: 'Category Name', // Groups FAQ items by category
}
```

## Site Structure

```
app/
├── page.tsx                 # Homepage
├── portfolio/
│   └── page.tsx            # Portfolio gallery page
├── blog/
│   ├── page.tsx            # Blog listing page
│   └── [slug]/page.tsx      # Individual blog post
├── faq/
│   └── page.tsx            # FAQ page
└── layout.tsx              # Root layout

components/
├── header.tsx              # Navigation header
├── footer.tsx              # Footer with links
├── hero-section.tsx        # Homepage hero
├── services-section.tsx    # Services showcase
├── testimonials-section.tsx # Testimonial carousel
├── contact-form.tsx        # Contact form
├── masonry-gallery.tsx     # Portfolio gallery component
├── blog-post-card.tsx      # Blog post preview card
└── faq-accordion.tsx       # FAQ accordion component

lib/
├── portfolio-data.ts       # Portfolio images
├── services-data.ts        # Services list
├── testimonials-data.ts    # Client testimonials
├── blog-data.ts           # Blog posts
└── faq-data.ts            # FAQ items
```

## Features

### Dark/Light Theme Toggle
- **System Preference Detection** - automatically uses your device's theme preference
- **Manual Toggle** - click the sun/moon icon in the header to switch themes
- **Smooth Transitions** - all colors transition smoothly between light and dark modes
- **Fully Styled** - entire site is optimized for both themes

### Animations & Motion
- **Smooth Page Transitions** - elements animate in when you scroll
- **Button Interactions** - hover and click animations for all interactive elements
- **Gallery Effects** - images scale smoothly on hover, smooth filter transitions
- **Modal Animations** - lightbox and modals fade in/out with scale effects
- **Built with Framer Motion** - professional animation library for performant effects

### Portfolio Gallery
- **Masonry Layout** (Pinterest-style) - images arrange automatically based on aspect ratio
- **Category Filtering** - toggle between "All Work", "Lifestyle", and "Studio"
- **Lightbox Modal** - click any image to view full-size with details
- **Responsive** - adapts from 1 column (mobile) to 4 columns (desktop)

### Blog
- **Blog Listing** - grid view of all posts
- **Individual Posts** - full-text articles with metadata
- **Read Time Estimation** - shows estimated time to read
- **Categories** - organize posts by topic

### FAQ
- **Accordion Interface** - click to expand/collapse answers
- **Grouped by Category** - FAQs organized by topic (Booking, Policies, etc.)
- **Smooth Animations** - professional interaction experience

### Contact Form
- **Formspree Integration** - form submissions go directly to your email
- **Validation** - required fields are enforced
- **Success Message** - confirms form submission
- **Responsive** - works on all device sizes

## Future Enhancement Ideas

These features could be added later if needed:

### Admin Dashboard
- Login system for managing content
- Upload images directly from the site
- Edit blog posts in a visual editor
- Manage testimonials without code

### Database Integration
- Store testimonials, services, and FAQs in a database
- Manage images via admin panel
- Publish blog posts without code changes
- Track contact form submissions

### Booking System
- Calendar integration for scheduling
- Automated booking confirmations
- Client payment processing via Stripe
- Session questionnaire form

### Newsletter
- Email collection on homepage
- Automated email campaigns
- Subscriber management

### Analytics
- Track visitor behavior
- See most popular portfolio images
- Monitor blog post views
- Contact form analytics

### Advanced Gallery Features
- Image upload with CloudinaryWidget
- Advanced filtering and search
- Social sharing for portfolio items
- Client password-protected galleries

### Social Media Integration
- Instagram feed integration
- Live Instagram posts
- Social sharing buttons
- TikTok embed support

### Video Content
- Hero video background
- Video blog posts
- Process/behind-the-scenes videos
- Tutorial videos

### E-commerce
- Print products shop
- Digital download store
- Session package purchasing

### SEO Enhancements
- Blog sitemap generation
- Meta tags optimization
- Open Graph images
- Schema markup for rich snippets

## Styling & Customization

The site uses Tailwind CSS v4 with built-in dark mode support. To customize:

### Colors & Theme
1. **Edit `app/globals.css`** - CSS custom properties and theme variables
2. Light mode: whites and light grays
3. Dark mode: dark grays and blacks (automatically applies when user toggles or device prefers dark mode)
4. All components use semantic dark: classes for proper dark mode support

### Typography
1. **Edit `app/layout.tsx`** - Change fonts via Google Fonts
2. Current: Geist (sans-serif) for all text
3. Update the Geist import and font-sans class to use different fonts

### Tailwind Configuration
1. **Edit `tailwind.config.ts`** - For advanced customization
2. Spacing, breakpoints, and other design tokens

Current design uses:
- **Colors:** Neutral grays with white and charcoal (light), with dark variants
- **Typography:** Geist (sans-serif) for all text
- **Layout:** Responsive flexbox with Tailwind classes
- **Theme:** Next-themes for dark/light mode switching

## Performance Optimization

- Next.js Image Optimization for Cloudinary images
- CSS Grid masonry for efficient gallery rendering
- Lazy loading for images
- Code splitting for better load times
- Static site generation for fast page loads

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

The site is ready to deploy to Vercel:

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Click "Deploy"

3. **Set up custom domain:**
   - In Vercel dashboard, go to Settings → Domains
   - Add your custom domain

## Troubleshooting

### Images not showing
- Check that Cloudinary URLs are correct
- Verify image width/height values in `portfolio-data.ts`
- Check browser console for CORS errors

### Contact form not working
- Verify Formspree Form ID is correct
- Check that it matches the `fetch` URL in `contact-form.tsx`
- Test form submission in browser console

### Blog posts not appearing
- Check that `slug` field matches the URL path
- Verify `publishedDate` is in `YYYY-MM-DD` format
- Check that post ID is unique

### Gallery filtering not working
- Ensure all portfolio items have valid `category` values
- Category must be either `'lifestyle'` or `'studio'`

## Complete Media Setup Guide

### Step-by-Step: Adding Your Portfolio Images

1. **Prepare Your Images**
   - Use high-quality originals (at least 2000px wide)
   - Supported formats: JPG, PNG, WebP
   - Landscape and portrait orientations work great with masonry

2. **Upload to Cloudinary**
   - Go to [cloudinary.com/console](https://cloudinary.com/console)
   - Click "Media Library" 
   - Create a folder called "portfolio" for organization
   - Upload your images (drag and drop works!)
   - Cloudinary will show the public URL after upload

3. **Get the Image Details**
   - Note the image filename (you'll see it in the URL)
   - Right-click the image → View Image → Copy the URL
   - Open your image in a new tab, right-click → Inspect (get width/height)

4. **Add to Your Portfolio**
   - Edit `lib/portfolio-data.ts`
   - Add or update entries with your Cloudinary URLs
   - Include accurate width/height from step 3
   - Use unique IDs like `'lifestyle-sunset-1'`

5. **Categorize Correctly**
   - Use `category: 'lifestyle'` for lifestyle/natural setting photos
   - Use `category: 'studio'` for studio/controlled environment photos
   - The homepage filter lets viewers switch between them

### Step-by-Step: Adding Testimonial Videos

1. **Prepare Your Videos**
   - Duration: 30 seconds to 2 minutes works best
   - Format: MP4 or MOV
   - Resolution: 1080p recommended
   - File size: Keep under 50MB for fast loading

2. **Upload to Cloudinary**
   - In Cloudinary Media Library, click "Upload"
   - Select your video file
   - It will process and show a URL

3. **Add to Testimonials**
   - Edit `lib/testimonials-data.ts`
   - Add the video URL to the `videoUrl` field
   - Optionally add a client photo URL to `imageUrl`

### Hero Section Background Image (Optional)

To add a hero background image:

1. Upload a wide image to Cloudinary (minimum 1920px wide)
2. Edit `components/hero-section.tsx`
3. Add this to the section tag:
   ```tsx
   style={{backgroundImage: 'url(YOUR_CLOUDINARY_URL)', backgroundSize: 'cover', backgroundPosition: 'center'}}
   ```

### File Size Optimization Tips

For best performance with large image libraries:

1. **Optimize images before uploading to Cloudinary:**
   - Use tools like ImageOptim or TinyPNG
   - Compression shouldn't noticeably reduce quality

2. **Use Cloudinary's image transformation:**
   - Add URL parameters for resizing on-the-fly
   - Example: `https://res.cloudinary.com/your-cloud/image/upload/w_800,h_1000,c_fill/image.jpg`
   - This saves bandwidth by serving optimized sizes

3. **Lazy load images in gallery:**
   - The masonry gallery already lazy loads
   - Images below the fold load only when needed

### Cloudinary Pro Tips

- **Organize with folders** - Create a "portfolio", "testimonials", "blog" structure
- **Use descriptive names** - `sunset-portrait-session.jpg` is better than `IMG_001.jpg`
- **Transformations** - Cloudinary can auto-crop, enhance, and filter images via URL params
- **Responsive images** - The gallery detects screen size and loads appropriately
- **Video delivery** - Cloudinary handles video streaming optimization automatically

## Support & Questions

For questions about:
- **Cloudinary setup:** See [Cloudinary docs](https://cloudinary.com/documentation)
- **Formspree setup:** See [Formspree docs](https://formspree.io/help)
- **Next.js/React:** See [Next.js docs](https://nextjs.org/docs)
- **Tailwind CSS:** See [Tailwind docs](https://tailwindcss.com/docs)

## License

Feel free to use this template for your photography business.

---

**Ready to go live?** Make sure to:
1. ✅ Add your Cloudinary Cloud Name and upload portfolio images to `lib/portfolio-data.ts`
2. ✅ Add testimonial videos to `lib/testimonials-data.ts` with your Cloudinary video URLs
3. ✅ Update Instagram handle in `components/hero-section.tsx`, `components/footer.tsx`, and anywhere else
4. ✅ Set up Formspree Form ID in `components/contact-form.tsx`
5. ✅ Update site title and meta description in `app/layout.tsx`
6. ✅ Test dark/light theme toggle (click sun/moon icon in header)
7. ✅ Review animations by scrolling through pages
8. ✅ Deploy to Vercel

### What's Included
- ✨ **Dark/Light Mode** - Automatic system detection with manual toggle
- 🎬 **Smooth Animations** - Framer Motion animations throughout
- 🖼️ **Pinterest-Style Gallery** - Masonry layout with filtering
- 📱 **Fully Responsive** - Mobile, tablet, and desktop optimized
- 🎨 **Beautiful Design** - Professional styling with Tailwind CSS
- 📝 **Blog System** - Blog listing and individual post pages
- ❓ **FAQ Section** - Accordion-style Q&A
- 📧 **Contact Form** - Formspree email integration

Your professional photography portfolio is ready to showcase your best work!
