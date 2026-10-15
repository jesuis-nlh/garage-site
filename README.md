# Garage website — configurable premium template

First instance: **Midas Villeurbanne Zola** (83-85 cours Émile Zola, 69100 Villeurbanne).

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · GSAP 3 (loaded on demand) · Zod 4.
All customer-facing copy is in French. Business data lives in one config file, never in components.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm run typecheck` / `npm run lint` / `npm run format` | TypeScript, ESLint (Next core-web-vitals + a11y), Prettier |
| `npm run check:launch` | Pre-launch audit: blocking items and warnings (exit code 1 while blockers remain) |
| `npm run qa:screens` | Desktop / tablet / mobile captures + console errors + horizontal overflow (server on :3100) |
| `npm run qa:interactions` | 46 functional checks (cursor, blueprint, services, finder, form, menu, keyboard, links, API) |
| `npm run render:assets` | Re-render the 3D stills and the hero video loop (headless Chromium + ffmpeg) |
| `npm run render:og` | Regenerate `public/og.jpg` from the garage config |

`qa:interactions` expects a server without delivery on `:3100`, a server with `LEAD_WEBHOOK_URL=http://127.0.0.1:4555/hook LEAD_WEBHOOK_SECRET=test-secret` on `:3101`, and `node qa/webhook-receiver.mjs` running.

---

## Environment variables

| Variable | Required | Role |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | Canonical URLs, sitemap, Open Graph. Must be the final HTTPS domain **at build time**. |
| `NEXT_PUBLIC_GARAGE_ID` | no | Active garage config (default `midas-villeurbanne-zola`). |
| `RESEND_API_KEY`, `LEAD_EMAIL_FROM`, `LEAD_EMAIL_TO` | one channel required | E-mail delivery through Resend (sender domain must be verified in Resend). `LEAD_EMAIL_TO` accepts a comma-separated list. |
| `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET` | one channel required | JSON POST to Make / Zapier / n8n / a CRM; the secret is sent as `X-Webhook-Secret`. |

Both channels can be enabled at once; a request succeeds if at least one channel accepts it.

---

## Architecture

```
src/
  config/
    types.ts                         ← GarageConfig model (the contract)
    garages/midas-villeurbanne-zola.ts ← all business data + source URL & date for each fact
    garages/_template.ts             ← starting point for a new garage (never imported)
    index.ts                         ← registry + active garage + French typography pass
  content/
    services.ts                      ← generic service catalogue (copy, includes, warning signs, SEO keyword)
    finder.ts                        ← symptom → services mapping (orientation, never a diagnosis)
  lib/                               ← hours (Europe/Paris), lead schema, delivery, JSON-LD, typography, motion loader
  components/
    layout/                          ← header + mobile menu, footer, mobile action bar, legal layout
    sections/                        ← one file per home section + client islands
    motion/                          ← custom cursor, scroll reveals
    ui/                              ← button (text roll + magnetic), icons, wordmark, service glyphs, stars, status
  app/
    page.tsx, services/[slug], mentions-legales, confidentialite, api/demande, sitemap.ts, robots.ts
```

### Adding a garage

1. Copy `src/config/garages/_template.ts` to `src/config/garages/<id>.ts` and replace **every** value with verified data (each fact has a `source` with URL and date).
2. Pick only the services the garage really offers in `services: [{ id: 'freinage' }, …]`. Optional per-service `short` / `long` overrides and `price` (only with a source).
3. Set the brand accent (`brand.colors.accent` + `accentInk` for AA contrast), wordmark, copy, hours, area served, booking options.
4. Register it in `src/config/index.ts`, set `NEXT_PUBLIC_GARAGE_ID`, run `npm run render:og` and `npm run check:launch`.

Everything else — navigation, service pages, sitemap, JSON-LD, finder, blueprint hotspots, footer, legal pages — is derived from the config. Hotspots and symptoms automatically hide services the garage does not offer.

---

## Booking / quote request

- Three-step form (service → vehicle & preferred slot → contact), validated with the **same Zod schema** in the browser and in `POST /api/demande`.
- Accessible errors: summary with links to fields (`role="alert"`, focus moved), `aria-invalid` / `aria-describedby`, step headings focused on change.
- Closed days (from the configured hours) and past dates are refused client- and server-side.
- Honest result states: **transmitted** (“the workshop will call you to confirm — the slot is not booked yet”), **not configured** (“your request was not sent” + call / network booking / copy request), **error**, **rate limited**. The site never claims a booking is confirmed.
- Protection: same-origin check, honeypot field, 5 requests / 10 min per IP. The limiter is in-memory: on multi-instance or serverless hosting, replace it with a shared store (Upstash, Redis…).
- Pre-filling: any “Demander ce service” button, the symptom finder and service pages (`/?service=freinage#rendez-vous`) pre-select the service and reason.
- The network booking page (`booking.external`) is offered as an alternative.

---

## Visual production

**Tool availability (verified in this environment, 15/10/2026):**

- **Bloom** MCP: models listed (Seedance 2.5 video; Seedream 5 Pro, Nano Banana 2/Pro, GPT Image 2.5 image models), but generation requires a `brand_session_id`; no brand existed and no brand-creation / listing / image-generation tool was exposed. **Not used.**
- **Higgsfield** MCP: only Katana preset run-tracking tools were exposed (no image/video generation). **Not used.**
- Stock photo hosts were not reachable from the build environment.

**Pipeline used instead** (`scripts/render/`): original procedural 3D scenes (drilled ventilated disc, yellow caliper, hub, wheel) built with Three.js, rendered in headless Chromium with a custom softbox environment, supersampled, then encoded with ffmpeg:

| Asset | Size |
| --- | --- |
| `public/media/hero-loop.mp4` / `.webm` — 8 s seamless loop, 1600 px | 0.95 MB / 0.80 MB |
| `public/media/hero-poster.jpg` — first frame (desktop poster) | 78 KB |
| `public/media/brake-assembly.png`, `wheel.png` — transparent stills (served as AVIF/WebP by `next/image`) | sources |
| `public/og.jpg` — Open Graph 1200×630 | 98 KB |

The video loads **only** on screens ≥ 1280 px, after first paint, and never with `prefers-reduced-motion` or Save-Data; it pauses off-screen. Mobile gets an optimised still. The footer states that visuals are illustrative 3D renders, not photos of the workshop.

**To use real media**: add files to `public/media/` and set `media.heroVideo`, `media.heroStill`, `media.secondary` and `media.workshopPhotos` (real workshop/team photos replace the 3D figure in “Notre garage” automatically).

---

## Interaction & motion system

- **Custom cursor** (fine pointer only, disabled with reduced motion): exact dot + inertial ring; states `link`, `cta` (“Réserver”), `call` (“Appeler”), `explore`; hidden over text fields; labels are offset so they never cover content.
- **Magnetic buttons** on primary CTAs (fine pointer, no reduced motion).
- **Signature interaction — X-ray side view**: a spotlight follows the pointer and reveals the mechanics under the body; hotspots open the matching service. Touch / keyboard: selecting a hotspot moves the spotlight; a toggle shows all mechanics; pannable on small screens.
- **Hero**: CSS-only intro (masked lines, clip reveal) so it never waits for JavaScript; scroll and pointer parallax on large screens.
- **Scroll reveals** via IntersectionObserver + CSS transitions; GSAP/ScrollTrigger are loaded on idle, only for parallax on large screens. No scroll hijacking.
- Everything respects `prefers-reduced-motion`.

---

## SEO

- Unique titles / descriptions / canonicals per page, `lang="fr"`, Open Graph + Twitter card, sitemap, robots.
- JSON-LD: `AutoRepair` (address, geo, hours, area served, brand, offer catalogue), `Service` + `BreadcrumbList` on each of the 10 service pages, `FAQPage`.
- `aggregateRating` is **intentionally not marked up**: Google does not allow self-serving review markup for a LocalBusiness on its own site. The rating is displayed with its source and date.
- Local wording uses verified geography only (Villeurbanne, Charpennes, Gratte-Ciel, Tonkin, Lyon 3e/6e, Caluire-et-Cuire, Vaulx-en-Velin, Bron).

---

## Verified results (15/10/2026, local production build, Lighthouse 13.5 in headless Chromium)

| Page | Perf. | A11y | Best pr. | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home — mobile (6 runs) | 93–98 | 100 | 100 | 100 | 2.4–3.0 s | 60–150 ms | 0 |
| Home — desktop (2 runs) | 100 | 100 | 100 | 100 | 0.6–0.7 s | 0 ms | 0 |
| /services/freinage — mobile (2 runs) | 98 | 100 | 100 | 100 | 2.3 s | 60–70 ms | 0 |
| /services/freinage — desktop | 100 | 100 | 100 | 100 | 0.6 s | 10 ms | 0 |
| /mentions-legales — mobile | 97 | 100 | 100 | 100 | 2.5 s | 60 ms | 0 |
| /confidentialite — mobile | 99 | 100 | 100 | 100 | 2.1 s | 50 ms | 0 |

Functional suite: 46/46 checks passed; no console errors (apart from the intentional HTTP 503 of the “delivery not configured” scenario). Scores will vary with hosting/CDN; re-run Lighthouse on the production domain.

---

## Data sources (relevé du 15/10/2026)

- Address, hours, “avec ou sans RDV”, rating **4,5/5 on 2 067 reviews** (collected by Midas after a service): [midas.fr — Villeurbanne Zola](https://www.midas.fr/centres-auto-midas/auvergne-rhone-alpes/rhone/lyon/villeurbanne-zola_1049) (read through search-engine summaries: the page itself was not reachable from the build environment).
- Phone 04 78 94 26 48 and address: [PagesJaunes](https://www.pagesjaunes.fr/pros/06530058), consistent with Allogarage, Yelp, Cylex, Bottin, 118712.
- Coordinates 45.771414, 4.870689: the Google Maps place link supplied with the brief.

## Before going live

Run `npm run check:launch`. Currently blocking: production domain, delivery channel, legal-notice data (company name, legal form, SIRET, publication director, host), owner confirmation of the service list, the editorial copy and the process steps. Warnings: metro stations to confirm on site, provisional wordmark, no real workshop photos, no named reviews.

**Brand note:** Midas is a franchise network. A franchisee’s website usually has to follow the network’s brand guidelines (logo, colours, wording, domain). Validate this site with the franchisee and the network before publishing; replace the provisional typographic wordmark with official assets if required.
