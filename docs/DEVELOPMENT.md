# DonateNOW: Development

## Project Structure

```
frontend/  React + Vite + Tailwind frontend (deployed to GitHub Pages and Vercel)
backend/   Spring Boot API + Spring Data JPA (PostgreSQL on Supabase, deployed to Railway)
```

## Development

First-time setup:

```bash
npm install                                    # installs frontend dependencies
cp backend/.env.example backend/.env   # then fill in DATABASE_URL (Supabase session pooler)
```

The database schema already exists in Supabase; the API reads and writes it through Spring Data JPA
without running its own migrations.

Day to day:

```bash
npm run dev       # frontend at http://localhost:5173/DonateNOW/ + API at http://localhost:3000
npm run build     # production build in frontend/dist
npm run deploy    # build and publish the frontend to GitHub Pages
```

The API alone: `cd backend && ./mvnw spring-boot:run`.

### API

| Method | Path                  | Description                                  |
| ------ | --------------------- | -------------------------------------------- |
| GET    | `/api/health`         | Health check                                 |
| GET    | `/api/opportunities`  | Volunteer opportunities (`?q=`, `?category=`) |
| POST   | `/api/contact`        | Save a contact form message                  |
| GET    | `/api/news`           | Ukraine news via GNews (cached 30 min)       |
| GET    | `/api/events`         | Upcoming events (`?lat=&lng=&radius=` km sorts by distance) |
| GET    | `/api/geocode`        | City name to coordinates via OpenStreetMap Nominatim |
| POST   | `/api/donations`      | Start a donation; returns the Every.org donate link |
| GET    | `/api/donations/stats`| Total raised through the site                |
| POST   | `/api/donations/webhook/:secret` | Every.org partner webhook (completed donations) |

### Donations (Every.org)

Donations are processed by [Every.org](https://www.every.org): donors pay on Every.org, which sends
the money to the charity and emails a tax receipt. DonateNOW never handles payments.

1. Clicking **Donate** creates a donation intent and redirects to Every.org with its id as
   `partner_donation_id`.
2. Every.org calls our webhook when a donation completes; it's recorded once per charge
   (monthly donations produce one record per month) and counted on the Home page.

Every.org doesn't sign webhooks, so the endpoint is protected by `DONATION_WEBHOOK_SECRET` in its URL
and only accepts donations that match an intent created on our site. Donatable charities are listed
in `backend/src/main/java/com/donatenow/server/service/Charities.java` and
`frontend/src/data/organizations.js` (`everyOrgSlug`).

To test without real money, set `EVERYORG_BASE_URL=https://staging.every.org` and pay with card
`4242 4242 4242 4242`.

### Importing events from Google

This is currently **disabled** after the backend moved from Node to Spring Boot. It previously searched
Google weekly (via SerpApi) for "Ukrainian events in &lt;city&gt;" and saved matches as PENDING for
review before publishing. The old implementation is still visible in this branch's git history if
it needs porting to Java. Until then, add events manually (see below).

### Adding events

Add rows directly in Supabase's Table Editor. Each event needs a start time with timezone, a
city/country, and latitude/longitude for the map.

## Deployment

| Part | Host | How |
| ---- | ---- | --- |
| Frontend (`frontend/`) | GitHub Pages | `npm run deploy` (builds with `frontend/.env.production`) |
| Frontend (`frontend/`) | Vercel | Deploys on push to `main`; Root Directory set to `frontend` |
| API (`backend/`) | Railway | Deploys on push to `main`; Root Directory set to `backend` |
| Database | Supabase | Schema managed directly; no migration tool wired up yet |

`frontend/.env.production`'s `VITE_API_URL` and Vercel's `VITE_API_URL` environment variable both
need to point at the Railway API's public URL (Railway Settings → Networking → Generate Domain),
with the `https://` scheme included.

Railway's `CLIENT_ORIGINS` environment variable must list every frontend origin allowed to call the
API (comma-separated), e.g. the GitHub Pages and Vercel URLs - otherwise the browser's CORS check
rejects the request.

The API reads its configuration from environment variables (see `backend/.env.example`):
`DATABASE_URL`, `DATABASE_POOL_MAX`, `PORT`, `CLIENT_ORIGINS`, `PUBLIC_SITE_URL`, `GNEWS_API_KEY`,
`EVERYORG_BASE_URL`, `EVERYORG_WEBHOOK_TOKEN`, `DONATION_WEBHOOK_SECRET`.
