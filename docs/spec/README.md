# GoCart — Module-wise Spec

Detailed, module-by-module reference for this repo, written from a full-codebase audit. `CLAUDE.md` at the repo root is the condensed version Claude Code auto-loads every session; these documents hold the full detail (every slice, every route, every endpoint, every component) that was deliberately left out of CLAUDE.md to keep it short.

- [01-state-management.md](01-state-management.md) — Redux store, every slice, `CartContext`
- [02-routing-pages.md](02-routing-pages.md) — routes, auth flow, checkout/order flow
- [03-api-integration.md](03-api-integration.md) — axios clients, full endpoint inventory, error handling
- [04-components-ui.md](04-components-ui.md) — component catalog, styling conventions

Each doc ends with a "Flagged issues" list — pre-existing bugs/inconsistencies found during the audit, not things introduced by this documentation pass. The most load-bearing of these are also summarized in `CLAUDE.md`'s "Known issues / landmines" section.

This snapshot reflects the codebase as of 2026-09-23. Re-verify against the current source before relying on specifics (file contents, line numbers) for anything beyond orientation — treat this as a map, not a live source of truth.
