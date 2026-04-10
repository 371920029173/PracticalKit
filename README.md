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
- Build output directory: `out`
- Framework preset: **None** (or “Next.js” only if your UI offers static export; the important part is the command + `out`).

### Connect GitHub (Workers & Pages → Pages)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorize GitHub and select the repo **`371920029173/PracticalKit`** (or your fork).
3. Configure the build:

   | Setting | Value |
   |--------|--------|
   | Production branch | `master` |
   | Build command | `npm run build` |
   | Build output directory | `out` |
   | Root directory | `/` (leave default if the repo root is this project) |

4. **Environment variables** (Project → **Settings** → **Environment variables** → Production):

   | Name | Value (example) |
   |------|------------------|
   | `NEXT_PUBLIC_SITE_URL` | `https://practicalkithub.com` |
   | `NEXT_PUBLIC_GA_ID` | *(optional)*`G-xxxxxxxx` |
   | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | *(optional)* Search Console token |

5. Save and deploy. Every `git push` to `master` triggers a new build.

### Environment variables (Pages → Settings → Environment variables)

- `NEXT_PUBLIC_SITE_URL` — canonical HTTPS origin for the live site (required for real traffic).
- `NEXT_PUBLIC_GA_ID` — your Google Analytics 4 Measurement ID (e.g. `G-XXXXXXXXXX`). Leave unset to ship without analytics and without the cookie banner.

Copy `.env.example` to `.env.local` for local builds if you want to test GA or production URLs.

### Bind your domain after purchase

1. Open Cloudflare Pages project for this repository.
2. Set `NEXT_PUBLIC_SITE_URL` to match the primary domain you will use (e.g. `https://practicalkithub.com`).
3. Go to `Custom domains` and add your apex and/or `www` as needed.
4. Follow Cloudflare DNS prompts to create/verify records.
5. In DNS, keep proxied status enabled.
6. Enable "Always Use HTTPS" in SSL/TLS settings.
7. Trigger a new deploy after changing `NEXT_PUBLIC_SITE_URL` so sitemap and meta tags rebuild.

**Note:** If the domain is registered at Xinnnet, point DNS to Cloudflare (nameservers or CNAME) as shown in the Pages custom-domain wizard.

## Notes

- `src/lib/site.ts` reads `NEXT_PUBLIC_SITE_URL` for the canonical site origin.
- `src/app/robots.ts` and `src/app/sitemap.ts` use that same URL.
- SEO: per-locale `canonical` + `hreflang` (`en`, `zh-CN`, `ru`, `es`, `x-default`), JSON-LD (`Organization` + `WebSite`), `manifest.webmanifest`, optional `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` for Search Console.
- `public/humans.txt` and `public/.well-known/security.txt` give crawlers/contact hints.
