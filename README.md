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
- `BETTER_AUTH_DB_PATH` — optional path for the SQLite file on a host with persistent storage.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — optional Google OAuth credentials.
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` — optional GitHub OAuth credentials.

OAuth buttons report an error if their provider credentials are not configured. The included SQLite file is intended for local development. On serverless deployments, its `/tmp` fallback is writable but ephemeral; configure a persistent database for durable user accounts and sessions.

## Useful scripts

```bash
npm run dev
npm run typecheck
npm run build
npm start
```
