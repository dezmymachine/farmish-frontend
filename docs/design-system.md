# Farmish Design System (Spectrum-inspired, shadcn-built)

Mechanics are shadcn (cva + Radix + Tailwind v4). Character is Adobe Spectrum 2:
attention hierarchy, 4pt spacing, role-based type, pill primary actions, 2px
focus rings. No `@react-spectrum/s2` runtime — philosophy and tokens only,
so the 170 KB route budget and Radix behavior stay intact.

## 1. Attention hierarchy (the one rule)

One high-attention element per view. The primary action wears `accent`
(growth green); everything else steps down: `secondary` (paper + line border),
`quiet` (text only), semantic colors only for status. Harvest gold is a
highlight, never a primary action. If two things compete, demote one.

## 2. Color (semantic, never hue names in code)

| Role                                              | Token                       | Use                            |
| ------------------------------------------------- | --------------------------- | ------------------------------ |
| `accent` / `accent-strong`                        | brand-600 / brand-800       | primary action bg / hover      |
| `on-accent`                                       | white                       | text on accent                 |
| `paper` / `wash`                                  | white / #f6f7f4             | surfaces / page bg             |
| `line`                                            | #e2e5de                     | borders                        |
| `ink` / `ink-soft` / `ink-faint`                  | #14210f / #3f4a3a / #6b7466 | headings / body / metadata     |
| `success` / `notice` / `negative` / `informative` | green / gold / red / blue   | status only, with `-subtle` bg |
| `harvest-*`                                       | gold ramp                   | badges, highlights — sparingly |

Dark mode: not in F0. Tokens are aliased (`accent`, `ink`, …) so a dark theme
lands by re-pointing aliases, not by touching components.

## 3. Type (role, not size)

`t-display` (hero) · `t-title-lg` (page) · `t-title` (card/section) ·
`t-body-lg` (lede) · `t-body` (prose) · `t-detail` (metadata, captions) ·
`t-ui` (buttons, labels, nav) · `t-code` (mono). Money always uses
tabular-nums (set globally on `body`).

## 4. Space, radius, elevation

4pt grid (`gap-2/3/4`, `p-4/6/8` …). Radius: `sm 4px` / `default 8px` /
`lg 12px` / `xl 16px` / `pill 999px` — primary buttons are pill by default.
Elevation: one `shadow-elevated` for cards; flat everywhere else. No decorative
shadows.

## 5. Interaction

- Focus: global 2px brand `:focus-visible` ring with 2px offset. Never remove it.
- Press: primary actions scale to 0.98 while pressed (`active:scale-[0.98]`).
- Motion: 150 ms ease for state changes; nothing slower without a reason.
- Sizes: `S / M / L / XL` on interactive components (default `M`).
- Icons: Hugeicons only (`~/components/ui/icon` over `@hugeicons/core-free-icons`), `aria-hidden` when decorative.

## 6. Component map (shadcn → Spectrum role)

- `Button` (`ui/button.tsx`): `accent` = primary · `secondary` = outline ·
  `quiet` = quiet · `negative` = destructive. Pill default, `shape="rounded"` escape hatch.
- `HealthBadge`: status dot + text, `role="status"`. Pattern for all status UI.
- Cards: `rounded-xl border-line bg-paper p-5 shadow-elevated`, title in `t-title`.
- Forms (F2/F4): label in `t-ui`, help in `t-detail`/`ink-faint`, errors map API
  `details[].field` next to the field, error text in `negative`.

## 7. Don'ts

- No raw hex in components — tokens only.
- No `text-*` size guesses — pick a `t-*` role.
- No second accent button next to the primary one — demote to `secondary`/`quiet`.
- No `dangerouslySetInnerHTML`, no money arithmetic in the UI (display only,
  `formatMoney` from F1), no tokens in localStorage (Firebase owns persistence).
