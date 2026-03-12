# KCAPTURED Branding Setup Guide

Complete guide for setting up logos, favicons, and brand assets for your KCAPTURED portfolio website.

## File Locations & Types

### 1. Logo (Main)
**File Location:** `/public/images/logo.png`
**Recommended Specs:**
- Format: PNG (with transparency)
- Dimensions: 180×40 pixels (aspect ratio 4.5:1)
- Color: White or color version (will show in light/dark mode)
- File size: < 50KB

**Usage in Code:**
Currently using text "KCAPTURED" in `components/header.tsx` (line 25).

To replace with logo image:
```tsx
// CURRENT (text version)
<Link href="/" className="text-2xl font-bold text-black dark:text-white">
  KCAPTURED
</Link>

// CHANGE TO (image version)
<Link href="/" className="flex items-center">
  <Image 
    src="/images/logo.png" 
    alt="KCAPTURED" 
    width={180} 
    height={40}
    priority
  />
</Link>
```

### 2. Favicon (Browser Tab Icon)
**File Location:** `/public/favicon.ico`
**Recommended Specs:**
- Format: ICO (recommended) or PNG
- Dimensions: 64×64 pixels minimum (32×32 or 48×48 also works)
- Should be simple, recognizable at small size
- Can be letter "K" or stylized camera icon
- File size: < 20KB

**Already Configured in:** `app/layout.tsx` (line 23)

### 3. Apple Icon (iOS/MacOS)
**File Location:** `/public/apple-icon.png`
**Recommended Specs:**
- Format: PNG
- Dimensions: 180×180 pixels (exact)
- Rounded corners will be added automatically by iOS
- Background: Same as favicon or full logo
- File size: < 30KB

**Already Configured in:** `app/layout.tsx` (line 23)

### 4. Social Media Share Image (Open Graph)
**File Location:** `/public/og-image.png` (OPTIONAL - currently using Cloudinary image)
**Recommended Specs:**
- Format: PNG or JPG
- Dimensions: 1200×630 pixels (16:9 aspect ratio)
- Text: "KCAPTURED" and tagline centered
- Background: One of your best photos, blurred or darkened
- File size: < 200KB

**Currently Configured in:** `app/layout.tsx` (line 35-40)
**Current image:** Cloudinary portfolio image

To use local image instead:
```tsx
openGraph: {
  images: [
    {
      url: '/og-image.png',  // Change to your local image
      width: 1200,
      height: 630,
      alt: 'KCAPTURED Photography',
    },
  ],
}
```

### 5. Twitter Card Image
**File Location:** Same as Open Graph (currently using Cloudinary)
**Specs:** Same as Open Graph (1200×630)

**Configured in:** `app/layout.tsx` (line 42-44)

## Creating Logos & Branding Assets

### Tools to Use:
1. **Canva** (Free) - Easy logo maker
   - go to canva.com
   - Search "photographer logo"
   - Customize colors to black/white

2. **Figma** (Free tier) - Professional design
   - Create vector logo
   - Export as PNG with transparency
   - Perfect for responsive sizing

3. **Photoshop/Gimp** - Full control
   - Design custom logo
   - Export at exact dimensions
   - Optimize for web

### Design Recommendations:
- **Style:** Minimalist, clean (matches black/white theme)
- **Colors:** Black, white, or grayscale (matches site brand)
- **Font:** Sans-serif, modern (similar to Geist font already used)
- **Elements:** Camera icon, lens, or stylized "K"
- **Versatility:** Should look good at 20px and 200px sizes

## File Size & Optimization

### Optimize Images Before Upload:

**Using online tools:**
1. TinyPNG (tinypng.com) - Compress PNG/JPG
2. ImageOptim (imageoptim.com) - Mac tool
3. OptiPNG (optipng.sourceforge.net) - PNG optimization

**Recommended file sizes:**
- Logo: < 50KB
- Favicon: < 20KB
- Apple Icon: < 30KB
- Social Share Image: < 200KB
- **Total:** < 300KB

## Color & Brand Guidelines

### Primary Colors (KCAPTURED)
- **Primary:** Black (#000000)
- **Secondary:** White (#FFFFFF)
- **Accent:** Gray tones (#333333 to #CCCCCC)

### Logo Color Versions:
1. **Black version** - For white/light backgrounds
2. **White version** - For black/dark backgrounds
3. **Grayscale version** - Flexible, works anywhere

### Font:
- **Headings:** Geist (already imported)
- **Body:** Geist Sans (already imported)
- **Logo:** Can use same font for consistency

## Testing & Deployment

### Before Publishing:

1. **Test Favicon:**
   - Open website in different browsers
   - Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
   - Check favicon appears on tab

2. **Test Social Sharing:**
   - Use Facebook Sharing Debugger
   - Use Twitter Card Validator
   - Paste your URL, verify image appears

3. **Test Different Devices:**
   - Desktop (Firefox, Chrome, Safari)
   - Mobile (iOS Safari, Chrome)
   - Tablet (iPad, Android)

### Deployment Steps:

1. **Add files to `/public/` folder:**
   ```
   /public/
     favicon.ico
     apple-icon.png
     og-image.png (optional)
     /images/
       logo.png
   ```

2. **Update code if using logo image** (see section 1 above)

3. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Add branding assets: logo, favicon, apple icon"
   git push origin main
   ```

4. **Verify on live site:**
   - Visit kcaptured.com
   - Check favicon in tab
   - Share on social media, verify image appears
   - Check on mobile

## Content Delivery & Caching

### How Images Are Served:

**Logo (/public/images/logo.png):**
- Served via Vercel CDN
- Cached by browser for 1 year
- Auto-optimized by Next.js Image component

**Favicon & Apple Icon:**
- Cached by browser for 1 year
- Multiple formats served based on device
- Best viewed at actual dimensions

**Social Share Images:**
- Cached by social platforms
- Facebook caches for 24 hours
- Use cache clearing tools for updates:
  - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
  - [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## Updating Branding Later

To update your logo or branding:

1. **Replace file** in `/public/` or `/public/images/`
2. **Keep same filename** (favicon.ico, apple-icon.png, etc.)
3. **Increment version** if needed for cache busting
4. **Clear social media caches** using validator tools
5. **Deploy to Vercel**
6. **Hard refresh browser** (Cmd+Shift+R)

## Troubleshooting

### Favicon Not Showing
- **Solution:** Hard refresh (Cmd+Shift+R)
- **Check:** File exists at `/public/favicon.ico`
- **Verify:** Dimensions are 64×64 or 32×32

### Logo Image Looks Blurry
- **Cause:** Image resolution too low
- **Solution:** Use higher resolution image (2x size)
- **Example:** 360×80px image displayed at 180×40px

### Social Media Share Image Wrong
- **Solution:** Use Facebook/Twitter validators to clear cache
- **Then:** Wait 24 hours for auto-update
- **Or:** Share with new URL parameter to bypass cache

### Images Not Optimized
- **Check:** File sizes using DevTools (Network tab)
- **Optimize:** Use TinyPNG or ImageOptim
- **Verify:** Files are < recommended sizes

## Additional Resources

- **Next.js Image Component:** https://nextjs.org/docs/app/api-reference/components/image
- **Vercel CDN:** https://vercel.com/docs/edge-network/overview
- **Web.dev Favicon Guide:** https://web.dev/articles/favicon-best-practices
- **Open Graph Protocol:** https://ogp.me/
- **Twitter Cards:** https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards

## Summary

| Asset | Location | Format | Size | Priority |
|-------|----------|--------|------|----------|
| Logo | /public/images/logo.png | PNG | 180×40px | HIGH |
| Favicon | /public/favicon.ico | ICO | 64×64px | HIGH |
| Apple Icon | /public/apple-icon.png | PNG | 180×180px | MEDIUM |
| Social Share | /public/og-image.png | PNG/JPG | 1200×630px | MEDIUM |
| Twitter Card | Same as OG | PNG/JPG | 1200×630px | MEDIUM |

All files are optional except Favicon (auto-generated by Next.js if missing).
For maximum SEO and social sharing, include all files.
