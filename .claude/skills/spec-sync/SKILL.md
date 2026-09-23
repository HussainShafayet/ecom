---
name: spec-sync
description: Keeps this repo's module-wise spec (docs/spec/*.md) and root CLAUDE.md in sync with the actual codebase. Use this whenever the user asks for a full codebase overview/audit ("full project overview dao", "audit the codebase"), whenever the user explicitly asks to update, sync, or refresh the spec/docs ("spec update koro", "spec sync koro", "docs update kore dao"), and proactively right after finishing any non-trivial implementation task in this repo (a new feature, a new Redux slice, a new route/page, a new API endpoint, a new component group, or a refactor that changes how an existing module works) so the spec never drifts out of date. Do not use this for trivial one-line tweaks that don't change architecture or behavior documented in the spec.
---

# Spec Sync

This repo documents itself in two layers:

- **`CLAUDE.md`** (repo root) — concise, auto-loads into every Claude Code session here. High-level architecture, commands, known issues, and conventions for extending the app.
- **`docs/spec/*.md`** — the detailed, module-wise reference. Only read on demand, so it can afford to be exhaustive (full state shapes, full endpoint tables, every component listed).

The point of keeping both updated is to avoid re-deriving the same understanding of this codebase from scratch every time — a fresh multi-agent audit of the whole repo is expensive and shouldn't be necessary once the spec exists. Prefer a small, targeted update over a full re-audit whenever the actual change is small.

## Step 1: Figure out which spec module(s) the task touches

| Spec file | Covers |
|---|---|
| `docs/spec/01-state-management.md` | `src/redux/` (store, all slices), `src/context/` |
| `docs/spec/02-routing-pages.md` | `src/App.js`, `src/pages/`, auth/checkout flows |
| `docs/spec/03-api-integration.md` | `src/api/`, `src/services/`, the endpoint inventory, error-handling pipeline |
| `docs/spec/04-components-ui.md` | `src/components/`, Tailwind/styling conventions |

If the change spans a genuinely new area none of these four cover (e.g. the app grows a payments module, a test suite, a second app shell), don't force it into an existing file — propose a new `docs/spec/0N-<name>.md` to the user, following the same structure (prose sections + a trailing "Flagged issues" list) and add it to `docs/spec/README.md`'s index.

## Step 2: Decide whether this needs subagents — and ask before launching any

This is the main judgment call, and it should track the actual size of the task, not the phrasing of the request:

- **Broad task** — "give me a full overview", "audit the codebase", a multi-module refactor, or the first time spec-sync runs on a repo that has no `docs/spec/` yet: this is a candidate for parallel subagents, one `Explore` (or `general-purpose`) agent per affected module.
- **Targeted task** — one feature, one slice, one page, one component touched: just read the changed files yourself and patch the relevant section(s) directly, no subagents. Spawning agents for a small diff wastes tokens and time for no benefit — the whole point of keeping the spec current incrementally is to make the expensive full-audit path rare.

For a broad task, **don't dispatch subagents automatically** — say which modules you'd cover and how many agents that means, and wait for the user to confirm before launching them. The user would rather approve the expensive step than have it fire on its own. Only once they confirm, dispatch one subagent per affected module in parallel, in a single message. Give each subagent a self-contained prompt: which files to read, what to report (state shape / props / endpoints as applicable to that module), and to end with a "flagged issues" list of anything odd, broken, or inconsistent it notices — not just a description of what the code does. Use the existing `docs/spec/*.md` files as the reference for the level of detail and tone expected back.

## Step 3: Update the spec files — in place, only what changed

- Edit the affected `docs/spec/0N-*.md` file(s) directly with Edit, not Write — preserve the surrounding structure and everything that's still accurate. Don't regenerate untouched files "while you're at it."
- Each file ends with a "Flagged issues" list. When you fix a bug that was flagged there, remove that entry (don't leave it as a stale warning). When you find a new issue while investigating, add it there rather than only mentioning it in chat.
- Only write down what you actually verified by reading the current source in this pass. Don't carry forward assumptions from a previous version of the spec without re-checking them, and don't pad the doc with speculation.

## Step 4: Update CLAUDE.md only if the change reaches that level

`CLAUDE.md` should only mention something if it belongs in one of its existing sections: Commands, Architecture, Known issues / landmines, or Extending the app. If the change is significant enough to affect how a future session should understand or work with this repo at a glance, update the relevant section there too — briefly, as a pointer or one-liner, never by copying paragraphs over from `docs/spec/`. If it's detail-level only (e.g. one more field on a slice), the `docs/spec/` update alone is enough; don't bloat CLAUDE.md to keep it cheap to auto-load every session.

## Step 5: Tell the user what changed

End with a short summary of which spec file(s) and which CLAUDE.md section(s) were touched, not a restatement of the whole spec.
