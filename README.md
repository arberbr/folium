# Folium

A private reading room for [arXiv](https://arxiv.org). Folium turns the daily preprint flood into a desk you can actually work at: a personalized drop, structured briefings, collections, and notes — all in one Next.js app.

## What it does

- **Today** — a drop assembled from the arXiv categories you follow
- **Explore** — search by claim, author, field, or raw arXiv id
- **Paper briefing** — TL;DR, claims, methods, limitations, novelty, and who should read it
- **Ask the abstract** — a chat grounded in the paper you have open
- **Library** — queue / reading / done / skipped, private notes, named collections

Auth is [Clerk](https://clerk.com). The database is local [libSQL](https://docs.turso.tech/libsql) (swap in Turso for production). Language models are bring-your-own-key: each reader connects their own [OpenRouter](https://openrouter.ai) key under Account → Integrations, and it is stored privately against their Clerk user.

## Stack

- Next.js 16 (App Router, React Compiler, Turbopack)
- React 19 + Tailwind CSS 4 + shadcn/ui
- Clerk v7
- Drizzle ORM + libSQL
- Vercel AI SDK 7 + `@openrouter/ai-sdk-provider`

## Setup

```bash
npm install
cp .env.example .env.local
```

The only thing to fill in is **Clerk** — create an application at [dashboard.clerk.com](https://dashboard.clerk.com), add `http://localhost:3000` to allowed origins, and paste the publishable and secret keys. There is no model provider key to configure, because Folium never holds one.

Then:

```bash
npm run dev
```
