---
name: update-docs
description: Analyze the codebase file by file, then update the documentation it has drifted from — docs/, README.md, and CLAUDE.md — changing only what the code proves is stale. Use when the user asks to update/refresh/sync the docs, says the README or CLAUDE.md is out of date, or types `/update-docs`.
---

# Updating documentation from the code

## What this skill does

Walks the codebase, compares what it finds against the prose that describes it, and
corrects the prose where the two disagree. Documentation is a **projection of the
code** — the code is the source of truth, so every edit here must be traceable to
something actually read in this pass.

## Procedure

1. **Inventory the docs.** Find every doc surface: `README.md`, `CLAUDE.md` /
   `AGENTS.md`, and anything under `docs/`. Note what each one claims to cover.
2. **Read the code, layer by layer.** Entry points, then the modules they reach:
   commands and scripts (`package.json`), config and env vars, public API surface,
   routes/pages, data model. Record the facts a reader would need.
3. **Diff prose against reality.** For each doc claim, mark it *accurate*,
   *stale* (the code moved), or *missing* (a real surface nothing documents).
4. **Edit only the deltas.** Fix stale claims and fill genuine gaps. Do not
   rewrite accurate sections, restructure for taste, or add sections the project
   never had.
5. **Report.** List what changed and why, and flag anything ambiguous rather than
   guessing.

## Scope rules

- **Every edit cites the code.** If you cannot point to the file that proves a
  claim is wrong, leave the claim alone.
- **No invented status.** Don't add roadmaps, test counts, "coming soon", or
  progress trackers — they drift the moment they land.
- **`CLAUDE.md` is instructions, not a changelog.** Update it only where the
  guidance it gives an agent has become wrong (moved paths, renamed commands,
  changed conventions).
- **Commands must be real.** Any command written into a doc has to exist in
  `package.json` (or the equivalent) exactly as written.
- **If nothing drifted, say so** and change nothing. An empty diff is a valid
  outcome.
