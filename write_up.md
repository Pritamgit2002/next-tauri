# Write-up

## Part D2 — Sync design note

I'd sync only the `tags` and `item_tags` rows to matching tables in Supabase Postgres — not the hardcoded items, since those never mutate locally. Each row would carry an `updated_at` timestamp (and a `device_id`), pushed on every local mutation when online (debounced by a second or two) plus a full reconciliation pass on app start and on reconnect, rather than a fixed polling interval. For a conflict — say the same tag renamed locally and on another device — I'd resolve with last-write-wins on `updated_at`, and use soft-delete tombstones (`deleted_at`) instead of hard deletes so a delete on one device can't be silently resurrected by a stale update arriving later from another. The failure mode I'd most want to guard against is clock skew between devices breaking last-write-wins ordering; I'd mitigate that by trusting a server-assigned timestamp (Postgres `now()` on write, or a monotonic counter) as the ordering source of truth instead of client clocks.

## Part E1 — Async update

Shipped Collections & Tags end-to-end: tag create/delete, per-item tag assignment via a small popover, a filter bar with live per-tag counts, and both empty states. Fixed the two `useTagFilter` bugs — a stale filter from a missing effect dependency, and a redundant `setState` causing extra render cycles — by replacing state+effect with a derived `useMemo`. Wired tags/assignments to local SQLite via Tauri commands so they survive restarts, with an in-memory fallback outside Tauri.

Still rough: no automated tests, and persistence failures only `console.error` instead of surfacing in the UI. Judgement call: items stay fixed/unpersisted (only tags and assignments hit SQLite), per the spec's hardcoded-sample-data framing. Blocker: the dev machine's disk filled up mid-build, delaying the Rust build verification and Part A screenshot until I diagnosed and safely cleared space.

## Part E2 — AI-workflow reflection

**Prompt 1:** _"According to this assessment PDF I've done the setup properly, Create a plan for the features asked, Bugs fixes, SQLite persistence and so... I'm choosing Track 1 — create a plan first of what to do."_
What I checked: before approving the generated plan, I cross-referenced every bullet against the PDF's actual submission checklist (mandatory README items, the `/fixes`, `/data`, `write_up.md` structure) rather than trusting that a plausible-sounding plan covered everything — a generated plan can sound complete while quietly missing a specific deliverable.

**Prompt 2:** _"Implement the plan as specified..."_
What I double-checked: when `cargo check` first failed, I didn't take the failure at face value as a code bug — I re-read the actual `lib.rs`/`page.tsx` file contents to confirm nothing had been corrupted, and traced the real cause to the build machine's disk being full rather than the new Rust/SQLite code being wrong.

**Prompt 3 (redirecting a plausible-but-wrong AI fix):** _"The tag dropdown inside each item card is being clipped — it doesn't overflow the card boundary. Fix it."_
The agent's first move was a React Portal with `getBoundingClientRect` positioning — visually fine, but it would break click-outside detection, since the menu sits outside the card's React subtree and `menuRef.current.contains(event.target)` would treat every menu click as outside. I redirected to the actual cause: `.card` had `overflow: hidden`, trapping the absolutely-positioned dropdown. The fix was two CSS lines — drop `overflow: hidden`, move `border-radius` onto the swatch. A Portal is for uncontrollable clipping contexts; here the layout was ours to fix.
