# farmish-frontend

TanStack Start web app for Farmish Ghana.

Scaffolded in Phase F0 of the plan in [farmish-backend](https://github.com/dezmymachine/farmish-backend) (`REDEVELOPMENT_PLAN.md`).

## Commands

| Command                           | What                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| `pnpm dev`                        | Dev server on :3000                                          |
| `pnpm typecheck`                  | `tsc6 --noEmit` (TypeScript 6)                               |
| `pnpm lint` / `pnpm format:check` | ESLint (typescript-eslint strict) / Prettier check           |
| `pnpm test`                       | Vitest unit tests                                            |
| `pnpm build` / `pnpm start`       | Production build / serve it on :3000                         |
| `pnpm test:e2e`                   | Playwright smoke (needs a build first)                       |
| `pnpm ci`                         | **The gate:** typecheck + lint + format + test + build + e2e |
| `pnpm gen:api`                    | API types (lands in F1)                                      |

Copy `.env.example` to `.env` for local dev (`VITE_API_BASE_URL` points at the backend).

## Design

`docs/design-system.md` is the visual guide: shadcn mechanics, Spectrum 2
character (attention hierarchy, 4pt grid, role type, pill actions, 2px focus
rings) over the Farmish brand palette.
