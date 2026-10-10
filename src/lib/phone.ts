/**
 * Ghana phone helpers. Mirrors the backend `internal/geo` rules
 * (DOMAIN.md §10): E.164 `+233` followed by 9 digits. Display-only;
 * validation still happens server-side.
 */

const E164_GH = /^\+233\d{9}$/

/**
 * Normalise user input to E.164: strip spaces and dashes, turn a leading
 * `0` or `233` into `+233`. Returns null when the result is not a valid
 * Ghana number.
 */
export function normalizeGhPhone(input: string): string | null {
  const compact = input.replace(/[\s-]+/g, '')
  let e164 = compact
  if (/^0\d{9}$/.test(compact)) {
    e164 = `+233${compact.slice(1)}`
  } else if (/^233\d{9}$/.test(compact)) {
    e164 = `+${compact}`
  }
  return E164_GH.test(e164) ? e164 : null
}

/** True when the value is already valid E.164 Ghana format. */
export function isGhPhoneE164(value: string): boolean {
  return E164_GH.test(value)
}

/**
 * Local display grouping: `+233241234567` → `024 123 4567`.
 * Pass-through for anything that is not valid E.164.
 */
export function formatGhPhone(value: string): string {
  if (!E164_GH.test(value)) return value
  const local = `0${value.slice(4)}`
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}
