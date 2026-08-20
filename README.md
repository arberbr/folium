# arXivDesk

A private desk for [arXiv](https://arxiv.org). arXivDesk turns the daily preprint flood into a workspace you can actually work at: a personalized drop and collections — all in one Next.js app.

## What it does

- **Today** — a drop assembled from the arXiv categories you follow
- **Explore** — search by claim, author, field, or raw arXiv id
- **Library** — queue / reading / done / skipped, named collections

Auth is [Clerk](https://clerk.com). The database is local [libSQL](https://docs.turso.tech/libsql) (swap in Turso for production). Each reader can connect their own [OpenRouter](https://openrouter.ai) key under Account → Integrations — it is stored privately against their Clerk user, ready for the model-powered features arXivDesk adds next.

## Stack

- Next.js 16 (App Router, React Compiler, Turbopack)
- React 19 + Tailwind CSS 4 + shadcn/ui
- TypeScript 7 + Biome + pnpm
- Clerk v7
- Drizzle ORM + libSQL

## Setup

```bash
pnpm install
cp .env.example .env.local
```

The only thing to fill in is **Clerk** — create an application at [dashboard.clerk.com](https://dashboard.clerk.com), add `http://localhost:3000` to allowed origins, and paste the publishable and secret keys. There is no model provider key to configure, because arXivDesk never holds one.

Then:

```bash
pnpm db:migrate
pnpm dev
```

Migrations live in `drizzle/`. A **local** database migrates once on server boot (`instrumentation.ts`), so a fresh file at `./data/local.db` is created automatically and `pnpm dev` needs no setup.

A **remote** database does not: migrations contain destructive statements, and a deploy must not apply DDL to production just by starting up. Run `pnpm db:migrate` from your release step when `TURSO_DATABASE_URL` points at Turso. Setting `DB_AUTO_MIGRATE=1` opts back into migrating on boot.
