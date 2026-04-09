# PracticalKit (toolkit-web)

Browser-first toolbox for PDF, image, data, text, developer workflows, and lightweight media conversion.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run lint
```

## Domain and deployment (Cloudflare Pages)

- **Set your real domain before production builds:** `NEXT_PUBLIC_SITE_URL=https://your-domain.com` (no trailing slash). This drives sitemaps, canonical URLs, Open Graph, and JSON-LD. If unset, the build falls back to `https://example.com` (replace immediately).
- Build command: `npm run build`
- Output directory: `out`

### Environment variables (Pages → Settings → Environment variables)

- `NEXT_PUBLIC_SITE_URL` — canonical HTTPS origin for the live site (required for real traffic).
- `NEXT_PUBLIC_GA_ID` — your Google Analytics 4 Measurement ID (e.g. `G-XXXXXXXXXX`). Leave unset to ship without analytics and without the cookie banner.

Copy `.env.example` to `.env.local` for local builds if you want to test GA or production URLs.

### Bind your domain after purchase

1. Open Cloudflare Pages project for this repository.
2. Set `NEXT_PUBLIC_SITE_URL` to match the primary domain you will use (e.g. `https://example.dev`).
3. Go to `Custom domains` and add your apex and/or `www` as needed.
4. Follow Cloudflare DNS prompts to create/verify records.
5. In DNS, keep proxied status enabled.
6. Enable "Always Use HTTPS" in SSL/TLS settings.
7. Trigger a new deploy after changing `NEXT_PUBLIC_SITE_URL` so sitemap and meta tags rebuild.

## Notes

- `src/lib/site.ts` reads `NEXT_PUBLIC_SITE_URL` for the canonical site origin.
- `src/app/robots.ts` and `src/app/sitemap.ts` use that same URL.
- SEO: per-locale `canonical` + `hreflang` (`en`, `zh-CN`, `ru`, `es`, `x-default`), JSON-LD (`Organization` + `WebSite`), `manifest.webmanifest`, optional `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` for Search Console.
- `public/humans.txt` and `public/.well-known/security.txt` give crawlers/contact hints.
