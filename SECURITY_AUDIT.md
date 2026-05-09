# Security Audit Report

## Summary

This repository is a mostly static Next.js portfolio site with a client-side contact form that posts to Formspree. No local API routes (`app/api`, `pages/api`, or custom server routes) were detected in the workspace.

The main security issues are:
- dependency vulnerabilities in the installed package tree
- insufficient client-side input validation and sanitization for the contact form
- one `dangerouslySetInnerHTML` usage in chart styling
- overly broad cache headers on all routes
- a build configuration that ignores TypeScript build errors

## Findings

### 1. Dependency vulnerabilities

`pnpm audit` / `npm audit` found the following vulnerabilities:
- `next` (high/moderate): multiple advisories including request smuggling, unbounded cache growth, DoS against Server Components, CSRF bypass in Server Actions
- `lodash` (high/moderate): code injection via `_.template` import key names and prototype pollution in `_.unset` / `_.omit`
- `path-to-regexp` (high): ReDoS via sequential optional groups and wildcard patterns
- `picomatch` (high/moderate): glob matching issues and ReDoS
- `hono` (moderate): cookie validation bypasses, IP matching issues, path traversal, middleware bypass, HTML injection in JSX SSR
- `brace-expansion` (moderate): memory exhaustion via zero-step sequences

Recommendations:
- update `next` to at least `16.2.4`
- update transitive dependencies where applicable
- run audits regularly and apply fixes

### 2. No exposed local API endpoints found

A repository-wide search did not find `app/api`, `pages/api`, `route.ts`, or other server route files. The app relies on an external Formspree endpoint for form submissions.

This reduces local attack surface, but it makes input handling dependent on an external provider.

### 3. Contact form input validation is weak

`components/contact-form.tsx` only uses HTML5 `required` and `type="email"` validation for user inputs. Missing protections include:
- no maximum length restrictions
- no pattern validation for subject/message content
- no client-side sanitization or normalization before submission
- no anti-spam/honeypot controls

If contact handling is ever moved to an internal endpoint, server-side validation must be implemented.

### 4. Hard-coded Formspree endpoint

The contact form uses the placeholder URL:
- `https://formspree.io/f/YOUR_FORM_ID`

This should be replaced with a real ID stored in environment configuration rather than hard-coded in source.

### 5. `dangerouslySetInnerHTML` in `components/ui/chart.tsx`

This code constructs CSS via `dangerouslySetInnerHTML`:

```tsx
<style dangerouslySetInnerHTML={{ __html: ... }} />
```

That is safe only if the source values are fully trusted and never derived from user input. If chart config values become user-controlled in the future, this could be an XSS vector.

### 6. Global cache headers may be too broad

`next.config.mjs` sets `Cache-Control: public, max-age=31536000, immutable` for all routes (`/:path*`).

Problems:
- dynamic HTML pages, authenticated content, or pages that change could be cached incorrectly
- future changes may accidentally expose stale or sensitive content

Recommend restricting long cache headers to static assets only.

### 7. TypeScript build errors are ignored

`next.config.mjs` includes:

```js
typescript: {
  ignoreBuildErrors: true,
}
```

This can hide type issues and prevent catching correctness or security-related problems early.

## Recommendations

1. Upgrade dependencies to patched versions immediately.
2. Replace hard-coded Formspree ID with an environment variable and keep secrets out of source control.
3. Add stronger validation to `components/contact-form.tsx`:
   - max-length constraints
   - sanitized or normalized text inputs
   - optional honeypot fields or CAPTCHA for spam protection
4. If you ever add internal API endpoints, implement server-side validation and sanitization using a schema library like Zod.
5. Avoid `dangerouslySetInnerHTML` unless absolutely necessary. If you must use it, sanitize the generated content and keep inputs fully trusted.
6. Scope cache headers to static assets only; do not apply long-lived caching to all routes.
7. Remove `ignoreBuildErrors: true` from `next.config.mjs`.
8. Run `pnpm audit` / `npm audit` regularly and integrate dependency scanning into CI.

## Notes

- No secret management or `.env` usage was found in the repository.
- No server-side route handlers exist in the current source tree.
- The app is currently lower-risk from a local API perspective, but dependency and input validation issues remain important.

---

## Post-Implementation Audit Report

### Implementations Applied

1. **Contact Form Enhanced** (`components/contact-form.tsx`):
   - Added `NEXT_PUBLIC_FORMSPREE_ID` environment variable handling to replace hard-coded placeholder
   - Implemented honeypot field to detect bot submissions
   - Added input length validation: name ≤100 chars, subject ≤150 chars, message ≤2000 chars
   - Sanitized input via `.trim()` before validation
   - Added `maxLength` HTML attributes on all form inputs
   - Added `autoComplete` hints for better UX
   - Added status indicator when form is disabled (no env var)

2. **Next.js Configuration Updated** (`next.config.mjs`):
   - Removed `ignoreBuildErrors: true` to enable TypeScript error catching
   - Restricted cache headers from `/:path*` to `/_next/static/:path*` for static assets only

3. **Chart CSS Sanitization** (`components/ui/chart.tsx`):
   - Added `sanitizeCssKey()` function to strip non-alphanumeric characters from CSS variable names
   - Added `sanitizeCssValue()` function to restrict CSS values to safe characters (colors, percentages, RGB, hex)
   - Applied sanitization to both keys and values before injecting into `dangerouslySetInnerHTML`

4. **Dependencies Updated**:
   - Upgraded `next` from `16.1.6` to `16.2.4` to patch:
     - HTTP request smuggling in rewrites
     - Unbounded image cache growth
     - Unbounded postponed resume buffering (DoS)
     - CSRF bypass in Server Actions
     - Denial of Service with Server Components

### Updated Audit Results

**Vulnerability Summary After Implementation:**
- 16 total vulnerabilities reported (audit counts paths, not unique packages)
- 12 moderate | 4 high severity
- **All Next.js vulnerabilities resolved** ✓

**Remaining Vulnerabilities** (not directly used in application):

| Package | Severity | Reason | Status |
|---------|----------|--------|--------|
| `lodash` | High | Transitive dependency via `shadcn` | Can be updated by shadcn maintainers |
| `path-to-regexp` | High | Transitive dependency (ReDoS) | Indirect via router dependency |
| `picomatch` | High | Transitive dependency via shadcn/fast-glob | Out of direct control |
| `brace-expansion` | Moderate | Transitive via shadcn/ts-morph | Out of direct control |
| `hono` | Moderate | Transitive dependency | Not used in production code |
| `@hono/node-server` | Moderate | Transitive dependency | Not used in production code |

### Security Posture After Changes

**Improved:**
- ✅ Input validation on contact form with length limits and sanitization
- ✅ Honeypot protection reduces spam bot submissions
- ✅ TypeScript errors no longer ignored—type safety catches potential issues
- ✅ Cache headers scoped appropriately to static assets
- ✅ CSS injection hardened with sanitization functions
- ✅ Environment variable for form endpoint removes hard-coded secrets

**Still Requires:**
- Transitive dependency updates should be pursued by shadcn and other upstream maintainers
- If using internal API routes in future, implement server-side validation with libraries like Zod
- Monitor for new dependency vulnerabilities quarterly

### Recommendations Going Forward

1. Set `NEXT_PUBLIC_FORMSPREE_ID` in production environment variables (not in `.env` file in source control)
2. Run `pnpm audit` regularly as part of CI/CD
3. Monitor upstream packages (shadcn, Next.js) for security updates
4. Avoid adding new packages with known transitive vulnerabilities
5. If the app grows to include internal APIs, use a validation schema library like Zod for request/response validation
