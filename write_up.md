# Write-up

## Part D2 — Sync design note

I'd sync only the `tags` and `item_tags` rows to matching tables in Supabase Postgres — not the hardcoded items, since those never mutate locally. Each row would carry an `updated_at` timestamp (and a `device_id`), pushed on every local mutation when online (debounced by a second or two) plus a full reconciliation pass on app start and on reconnect, rather than a fixed polling interval. For a conflict — say the same tag renamed locally and on another device — I'd resolve with last-write-wins on `updated_at`, and use soft-delete tombstones (`deleted_at`) instead of hard deletes so a delete on one device can't be silently resurrected by a stale update arriving later from another. The failure mode I'd most want to guard against is clock skew between devices breaking last-write-wins ordering; I'd mitigate that by trusting a server-assigned timestamp (Postgres `now()` on write, or a monotonic counter) as the ordering source of truth instead of client clocks.

## Part E1 — Async update

Shipped Collections & Tags end-to-end: tag create/delete, per-item tag assignment via a small popover, a filter bar with live per-tag counts, and both empty states. Fixed the two `useTagFilter` bugs — a stale filter from a missing effect dependency, and a redundant `setState` causing extra render cycles — by replacing state+effect with a derived `useMemo`. Wired tags/assignments to local SQLite via Tauri commands so they survive restarts, with an in-memory fallback outside Tauri.

Still rough: no automated tests, and persistence failures only `console.error` instead of surfacing in the UI. Judgement call: items stay fixed/unpersisted (only tags and assignments hit SQLite), per the spec's hardcoded-sample-data framing. Blocker: the dev machine's disk filled up mid-build, delaying the Rust build verification and Part A screenshot until I diagnosed and safely cleared space.

## Part E2 — AI-workflow reflection

**Prompt 1:** *"According to this assessment PDF I've done the setup, I'm not clear about what's being asked here, I'm choosing Track 1 — create a plan first of what to do."*
What I checked: before approving the generated plan, I cross-referenced every bullet against the PDF's actual submission checklist (mandatory README items, the `/fixes`, `/data`, `write_up.md` structure) rather than trusting that a plausible-sounding plan covered everything — a generated plan can sound complete while quietly missing a specific deliverable.

**Prompt 2:** *"Implement the plan as specified... don't stop until you've completed all the to-dos."*
What I double-checked: when `cargo check` first failed, I didn't take the failure at face value as a code bug — I re-read the actual `lib.rs`/`page.tsx` file contents to confirm nothing had been corrupted, and traced the real cause to the build machine's disk being full rather than the new Rust/SQLite code being wrong.

**Prompt 3 (mid-task decision):** *When blocked by the full disk, I was asked whether to free space myself, let the agent clean up known-safe caches, or skip verification entirely — I chose "let the agent clean up safe caches."*
What I changed/verified: I had it show me the exact directories it intended to clear (Xcode/cargo/npm/browser caches) before approving the `rm -rf`, rather than accepting a broad cleanup unchecked, since it required bypassing normal write protections outside the project folder.
