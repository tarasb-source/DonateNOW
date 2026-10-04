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
