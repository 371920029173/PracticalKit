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
