<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# arXivDesk conventions

Everything below is enforced by review, not by a linter. Follow the existing shape rather than introducing a second one.

## Server Functions

Every mutation in `lib/actions.ts` follows the same four steps, in this order:

```ts
export async function doThingAction(input: string) {
  return asAction(async () => {          // 1. envelope: ActionError -> { ok: false, error }
    const userId = await requireUserId(); // 2. authorize, always first
    const value = parseWith(schema, input); // 3. validate with a zod schema from lib/validations
    await mutate(userId, value);          // 4. execute, then invalidate
    revalidateThing(value);
  });
}
```

- **Authorize first.** `requireUserId()` is the first statement. A route or action that reaches the data layer before authorizing is a bug, and `lib/ai/routes.test.ts` asserts the ordering.
- **Never call `revalidatePath` inline.** Add a helper to `lib/revalidate.ts` so the paths stay testable and in one place.
- **Reads need no envelope.** `asAction` exists to catch `ActionError`; a function that cannot throw one does not need wrapping.
- **Throw `ActionError` for anything the reader should see.** Any other throw is redacted by Next.js, which is the point — `lib/errors.ts` documents the split.

## Data access

- Every query on user-owned data is scoped by `userId`. Collections go through `requireOwnedCollection`, which is the single ownership gate.
- `collection_papers` has no owner column on purpose: it is only reachable through an already-authorized parent. Keep it that way.
- Cross-user isolation is tested against a real in-memory database (`lib/data/*.test.ts`). New user-scoped tables get the same treatment.

## Anything that spends money

Briefings and chat run on the reader's own OpenRouter key, and each Clerk key lookup counts against a rate limit.

- **Never start a model call from an effect.** `submit` / `sendMessage` from the AI SDK hooks are new functions on every render, so an effect that depends on one re-fires itself forever — and each pass is a paid request plus a Clerk `getUser`. Model calls start from a click.
- **Never render a stand-in that looks like model output.** If there is no briefing, show the placeholder in `components/paper-briefing.tsx` — inert bars, not sentences derived from the abstract. Text shaped like analysis reads as analysis.

## Client components

- `"use client"` goes on interaction leaves, not on pages. Pages are Server Components.
- Mutations run through the `useServerAction` hook — it owns pending state, error toasts, and `router.refresh()`.
- **Do not seed `useState` from a server prop** unless something re-syncs it. Two components can write the same row, and a latched copy will lie. `components/save-button.tsx` reads its prop directly; `components/share-collection-button.tsx` re-syncs on open.
- Optimistic updates must roll back in `onError` — see `components/add-to-shelf.tsx`.

## House rules

- `@/` path alias everywhere; no relative imports that climb.
- No `any`, no `@ts-ignore`, no lint suppressions, no `console.*` in app code, no `.skip`/`.only`. All are currently at zero — keep them there.
- Comments explain *why*. A comment that restates the code gets deleted.
