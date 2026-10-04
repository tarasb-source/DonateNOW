# DonateNOW 
**DonateNOW** is a simple, responsive website designed to raise awareness about the war in Ukraine and provide information about where to donate money and find volunteer opportunities. While the donation system is implemented only as a demonstration and does not process real payments, the information about charities and volunteer opportunities is accurate.


**Live Website:**  
https://tarasb-source.github.io/DonateNOW/

---

## Features

- Clean and modern UI
- Responsive design (desktop & mobile friendly)
- Clear donation-focused layout
- Hosted using **GitHub Pages**

---

## Built With

- **HTML**
- **CSS3**
- **JavaScript**
- **GitHub Pages** for deployment

---

## Project Structure

```
client/   React + Vite + Tailwind frontend (deployed to GitHub Pages)
server/   Express API + Prisma (PostgreSQL on Supabase)
```

## Development

First-time setup:

```bash
npm install                          # installs all workspaces and generates the Prisma client
cp server/.env.example server/.env   # then fill in DATABASE_URL (Supabase session pooler)
npm run db:migrate -w server         # create tables
npm run db:seed -w server            # load the volunteer opportunities
npm test -w server                   # run server tests
```

Day to day:

```bash
npm run dev       # frontend at http://localhost:5173/DonateNOW/ + API at http://localhost:3000
npm run build     # production build in client/dist
npm run deploy    # build and publish the frontend to GitHub Pages
```

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

1. Clicking **Donate** creates a `DonationIntent` and redirects to Every.org with its id as
   `partner_donation_id`.
2. Every.org calls our webhook when a donation completes; it's recorded once per charge
   (monthly donations produce one record per month) and counted on the Home page.

Every.org doesn't sign webhooks, so the endpoint is protected by `DONATION_WEBHOOK_SECRET` in its URL
and only accepts donations that match an intent created on our site. Donatable charities are listed
in `server/src/donations/charities.js` and `client/src/data/organizations.js` (`everyOrgSlug`).

To test without real money, set `EVERYORG_BASE_URL=https://staging.every.org` and pay with card
`4242 4242 4242 4242`.

### Importing events from Google

Events are found weekly by searching Google (via [SerpApi](https://serpapi.com)'s free plan,
250 searches/month) for "Ukrainian events in <city>" across the cities in
`server/src/eventImport/cities.js`. Results that mention Ukraine in their title or description
are saved as **PENDING** and only appear on the site once approved.

```bash
npm run events:import -w server -- --dry-run          # preview without saving
npm run events:import -w server                       # import (1 search per city)
npm run events:import -w server -- --city="Chicago, IL"
npm run events:review -w server                       # approve / reject pending events
```

The `Import events` GitHub Actions workflow runs the import every Monday. It needs the
repository secrets `DATABASE_URL` and `SERPAPI_KEY` (Settings → Secrets and variables → Actions).

### Adding events

Add rows in Supabase's Table Editor, run `npm run db:studio -w server`, or list them in
`server/prisma/seed-events.js` (see the example there) and run `npm run db:seed -w server`
on an empty Event table. Each event needs a start time with timezone, a city/country,
and latitude/longitude for the map.

## Deployment

| Part | Host | How |
| ---- | ---- | --- |
| Frontend (`client/`) | GitHub Pages | `npm run deploy` (builds with `client/.env.production`) |
| API (`server/`) | Vercel | Deploys on push; project Root Directory = `server` |
| Database | Supabase | `npm run db:deploy -w server` applies migrations |
| Event import | GitHub Actions | Weekly; needs `DATABASE_URL` and `SERPAPI_KEY` secrets |

Vercel environment variables (Project → Settings → Environment Variables), without quotes:
`DATABASE_URL`, `DATABASE_POOL_MAX` (2-3), `CLIENT_ORIGINS` (`https://tarasb-source.github.io`),
`PUBLIC_SITE_URL` (`https://tarasb-source.github.io/DonateNOW`), `GNEWS_API_KEY`,
`EVERYORG_BASE_URL` (`https://www.every.org`), `EVERYORG_WEBHOOK_TOKEN`, `DONATION_WEBHOOK_SECRET`.
