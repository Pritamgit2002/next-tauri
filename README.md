# Collections & Tags — Tauri + Next.js Desktop App

**Track chosen: Track 1 — Web & Desktop (TypeScript, React, Next.js, Tauri).**
This is my strongest day-to-day stack, and it matches the actual shape of the role: a Tauri desktop shell around a Next.js/React frontend, with a thin Rust layer for local persistence.

A small desktop design-asset library where you can create tags, assign/remove them on items, and filter the list by tag — tags and assignments persist locally in SQLite via a Tauri command, so they survive an app restart.

## Setup approach

Because `npm create tauri-app@latest` does not offer a Next.js template directly, the approach used here (per Tauri's own docs) is:

1. Scaffold a standard Next.js project.
2. Install `@tauri-apps/cli` and run `tauri init` inside it.
3. Configure Next.js for static export (`output: 'export'`) so Tauri can serve the built assets.

This gives an equivalent result to a first-party template and is the recommended path for Next.js + Tauri.

## Prerequisites

| Tool | Required version |
|------|-----------------|
| Node.js | LTS 18+ |
| Rust / Cargo | stable (≥ 1.70) |
| Xcode Command Line Tools | latest |

```bash
xcode-select --install
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

## Project structure

```
collections-tags/
├── app/                  # Part B — feature code (Next.js App Router)
│   ├── components/       # TagManager, FilterBar, ItemCard, EmptyState
│   └── lib/               # types, sample data, Tauri persistence client
├── fixes/                # Part C — corrected useTagFilter.ts with fix comments
├── data/                 # Part D — SQLite schema + copies of the read/write code
├── src-tauri/            # Part D — Rust/Tauri backend (commands.rs, db.rs)
├── write_up.md           # Part D2 (sync note) + Part E (async update, AI reflection)
└── README.md
```

## How to install & run

```bash
cd collections-tags
npm install
npm run tauri dev
```

Next.js starts on `http://localhost:3000`; Tauri compiles the Rust side (including `rusqlite`'s bundled SQLite) and opens a native desktop window pointing at that dev server. The first compile takes ~20–60s — subsequent rebuilds are fast.

You can also run `npm run dev` on its own to iterate on the UI in a plain browser tab — the app detects it isn't inside Tauri (no `__TAURI_INTERNALS__` global) and falls back to in-memory state, so tag/assignment changes just won't persist across reloads in that mode.

### Production build

```bash
npm run tauri build
```

Outputs a signed `.app` (macOS), `.exe` (Windows), or `.deb`/`.AppImage` (Linux) under `src-tauri/target/release/bundle/`.

## Part A — Sanity check screenshot

`npm run tauri dev` builds cleanly and opens a native desktop window that loads the app (verified: `cargo check`/`cargo run` succeed and the window serves `GET /` successfully).

<img width="1920" height="1080" alt="Screenshot 2026-08-01 at 9 59 04 AM" src="https://github.com/user-attachments/assets/f8496b61-bd73-48fc-bff1-27c223413088" />

> Note: this screenshot was captured from the same UI running in a browser tab, since the sandboxed environment used to build this didn't have macOS Screen Recording permission to capture the native window's pixels directly. The rendered content is identical to what the Tauri window displays — if you'd like a screenshot with the native title bar included, run `npm run tauri dev` and swap in a `Cmd+Shift+4` capture of the window.

## What I'd do differently with more time

- Add a lightweight test (Vitest/RTL) around `useTagFilter` (Part C) and the tag-assignment logic in `page.tsx` — the assessment's time-box didn't leave room for it, but it's the first thing I'd add given more time.
- Batch the SQLite writes (currently one `invoke` call per mutation) into a single transaction for bulk operations, if the item/tag count grew a lot.
- Add proper optimistic-UI error handling — failures currently just `console.error`; I'd add a toast plus a rollback of the optimistic local state update if a persistence call fails.
- Swap the hand-rolled outside-click popover in `ItemCard` for a small headless-UI primitive if this grew beyond the one popover type used here.
- Add drag-to-reorder or a search box for the item grid once the library grows past a couple dozen items.
