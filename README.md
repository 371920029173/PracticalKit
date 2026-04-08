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

- Target domain: `https://practicalkit.com`
- Build command: `npm run build`
- Output directory: `out`

### Environment variables (Pages → Settings → Environment variables)

- `NEXT_PUBLIC_GA_ID` — your Google Analytics 4 Measurement ID (e.g. `G-XXXXXXXXXX`). Leave unset to ship without analytics and without the cookie banner.

Copy `.env.example` to `.env.local` for local builds if you want to test GA.

### Bind `practicalkit.com` after purchase

1. Open Cloudflare Pages project for this repository.
2. Go to `Custom domains` and add:
   - `practicalkit.com`
   - `www.practicalkit.com` (optional but recommended)
3. Follow Cloudflare DNS prompts to create/verify records.
4. In DNS, keep proxied status enabled.
5. Enable "Always Use HTTPS" in SSL/TLS settings.
6. Wait for certificate issuance, then verify:
   - `https://practicalkit.com`
   - `https://www.practicalkit.com`

## Notes

- `src/lib/site.ts` stores canonical site constants.
- `src/app/robots.ts` and `src/app/sitemap.ts` are configured for `practicalkit.com`.
- SEO: per-locale `canonical` + `hreflang` (`en`, `zh-CN`, `ru`, `es`, `x-default`), JSON-LD (`Organization` + `WebSite`), `manifest.webmanifest`, optional `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` for Search Console.
- `public/humans.txt` and `public/.well-known/security.txt` give crawlers/contact hints.
