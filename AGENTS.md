# AGENTS.md: farmish-frontend

The TanStack Start web app for Farmish Ghana. **All plans, rules and specs live in the backend repo:**

- `../farmish-backend/AGENTS.md`: the workflow and hard rules (one phase per task, review packets, never push)
- `../farmish-backend/docs/phases/frontend.md`: the **F0–F9 specs** (stack, structure, per-phase deliverables and tests)
- `../farmish-backend/docs/DOMAIN.md`: money display, order states, business rules the UI must mirror
- `../farmish-backend/api/openapi.yaml`: the API contract (generate types from it; never hand-write API types)

Plan checkboxes, ADRs and review packets for frontend phases are committed in the backend repo. Code is committed here. The frontend starts at F0 once backend Phase 12 is done (F3+ after the Phase 22 contract freeze).
