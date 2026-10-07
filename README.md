# বাজার দর — BazarDor

বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের আজকের বাজারদর, বাজারভিত্তিক মূল্য এবং প্রতিদিনের দামের ওঠানামা এক জায়গায় দেখার জন্য একটি responsive বাজার-তথ্য অ্যাপ।

## Technologies

- Next.js 15 App Router and React 19
- TypeScript and Tailwind CSS
- BetterAuth with email/password and optional Google/GitHub OAuth
- SQLite (`better-sqlite3`) for local authentication data
- BazarDor market API
- `react-hot-toast` and Lucide icons

## Features

1. Responsive Bengali storefront with live prices and an animated market ticker.
2. Top daily price risers and fallers, searchable product cards, and Bengali numerals.
3. Category pages with loading skeletons, friendly empty states, and numeric price sorting.
4. Authenticated product details with price summaries and market-by-market ranges.
5. BetterAuth sign-up, sign-in, protected pages, and optional Google/GitHub sign-in.
6. Profile page with BetterAuth-powered name updates.
7. Friendly not-found pages and a server-side API proxy with an alternate market API.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Local development uses a SQLite database at `data/auth.sqlite` and a development-only BetterAuth secret.

## Environment configuration

Copy `.env.example` to `.env.local` and set:

- `BETTER_AUTH_SECRET` — a unique secret of at least 32 characters; required in production.
- `BETTER_AUTH_URL` — the canonical app URL, such as `https://your-domain.vercel.app`.
- `DATABASE_URL` — a Neon Postgres connection string; required in production. Use Neon’s pooled connection string for Vercel.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — optional Google OAuth credentials.
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` — optional GitHub OAuth credentials.

Local development uses SQLite when `DATABASE_URL` is unset. With a Neon connection string present, the app uses Postgres; run `npm run auth:migrate -- --yes` to create BetterAuth’s tables before starting the app.

## Deploying to Vercel

1. Create a Neon Postgres database and copy its pooled connection string into `DATABASE_URL`.
2. Import this Git repository into Vercel and add `DATABASE_URL`, a securely generated `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` (your production HTTPS URL) to the project’s environment variables.
3. Before the first deployment, run `npm run auth:migrate -- --yes` locally with the same `DATABASE_URL` and `BETTER_AUTH_SECRET` in `.env.local`.
4. Deploy with Vercel’s default Next.js build settings (`npm run build`).
5. If enabling Google or GitHub sign-in, add their client credentials in Vercel and register the deployed URL’s `/api/auth/callback/google` or `/api/auth/callback/github` callback with the provider.

OAuth buttons report an error if their provider credentials are not configured. Never commit `.env.local` or production credentials.

## Useful scripts

```bash
npm run dev
npm run typecheck
npm run build
npm start
```
