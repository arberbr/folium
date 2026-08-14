# Folium

A private reading room for [arXiv](https://arxiv.org). Folium turns the daily preprint flood into a desk you can actually work at: a personalized drop, structured briefings, collections, and notes — all in one Next.js app.

## What it does

- **Today** — a drop assembled from the arXiv categories you follow
- **Explore** — search by claim, author, field, or raw arXiv id
- **Paper briefing** — TL;DR, claims, methods, limitations, novelty, and who should read it
- **Ask the abstract** — a chat grounded in the paper you have open
- **Library** — queue / reading / done / skipped, private notes, named collections

Auth is [Clerk](https://clerk.com). The database is local [libSQL](https://docs.turso.tech/libsql) (swap in Turso for production). Language models go through the [Vercel AI Gateway](https://vercel.com/ai-gateway).

## Stack

- Next.js 16 (App Router, React Compiler, Turbopack)
- React 19 + Tailwind CSS 4 + shadcn/ui
- Clerk v7
- Drizzle ORM + libSQL
- Vercel AI SDK 7

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in:

1. **Clerk** — create an application at [dashboard.clerk.com](https://dashboard.clerk.com), add `http://localhost:3000` to allowed origins, and paste the publishable + secret keys.
2. **AI Gateway** (optional but recommended) — create a key at [Vercel AI Gateway](https://vercel.com/ai-gateway). Without it, search and collections still work; briefings fall back to a heuristic sketch of the abstract.

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite file is created automatically at `data/folium.db`.

## Production

Point `TURSO_DATABASE_URL` (and `TURSO_AUTH_TOKEN`) at a Turso database, set the Clerk production keys, and deploy to Vercel. Add `AI_GATEWAY_API_KEY` or rely on Vercel OIDC for the gateway.
