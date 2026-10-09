# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`farmish-frontend` is the TanStack Start web app for Farmish Ghana. It is built after the backend v1 contract is frozen (backend Phase 22); phases F0–F2 may start after Phase 12.

The plan, conventions, phase checklist and ADRs live in the sibling backend repo:

- `../farmish-backend/REDEVELOPMENT_PLAN.md` (see "Frontend phases")
- `../farmish-backend/CLAUDE.md` (working rules: one phase per task, tick and log on completion)
- `../farmish-backend/docs/adr/`

Plan/ADR updates for frontend phases are committed to the backend repo. The legacy app at `~/work/farmgate` is read-only reference.

## Commands

| Command         | What                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| `pnpm dev`      | Dev server on :3000                                                      |
| `pnpm ci`       | **The gate:** typecheck + lint + format:check + test + build + e2e smoke |
| `pnpm test:e2e` | Playwright smoke (needs `pnpm build` first)                              |

Copy `.env.example` to `.env` for local dev.
