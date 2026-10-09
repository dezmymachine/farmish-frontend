import type { components } from '~/api/schema'

export type ErrorDetail = components['schemas']['ErrorDetail']
export type ErrorCode = string

/**
 * Normalised error thrown for any failed API call. Carries the HTTP status
 * and the backend's stable snake_case `code` so callers and the global
 * query-cache net can branch on it without parsing messages.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: ErrorDetail[]

  constructor(status: number, code: string, message: string, details?: ErrorDetail[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isConflict(): boolean {
    return this.status === 409
  }

  /** Parse the `{ error: { code, message, details? } }` envelope. Never throws. */
  static fromBody(status: number, body: unknown): ApiError {
    if (body !== null && typeof body === 'object') {
      const root = body as Record<string, unknown>
      const err = root['error']
      if (err !== null && typeof err === 'object') {
        const e = err as Record<string, unknown>
        const details = Array.isArray(e['details']) ? (e['details'] as ErrorDetail[]) : undefined
        return new ApiError(
          status,
          typeof e['code'] === 'string' ? e['code'] : 'http_error',
          typeof e['message'] === 'string' ? e['message'] : 'Request failed',
          details,
        )
      }
    }
    if (typeof body === 'string' && body.length > 0) {
      return new ApiError(status, 'http_error', body)
    }
    return new ApiError(status, 'http_error', 'Request failed')
  }
}

/** Backend code → user-facing copy. Messages from the API are never shown raw. */
export const ERROR_COPY: Record<string, string> = {
  bad_request: 'That request was not understood. Please try again.',
  validation_failed: 'Please fix the highlighted fields and try again.',
  unauthorized: 'Your session expired. Please sign in again.',
  reauth_required: 'For your security, please verify it is you to continue.',
  forbidden: 'You do not have permission to do that.',
  not_found: 'That was not found. It may have been removed.',
  method_not_allowed: 'That action is not supported here.',
  rate_limited: 'Too many attempts. Please wait a moment and try again.',
  turnstile_failed: 'The security check failed. Please try again.',
  invalid_transition: 'That action is no longer available for this order.',
  seller_profile_required: 'Complete your seller profile first.',
  listing_suspended: 'This listing is currently suspended.',
  conflict: 'That conflicts with the current state. Please refresh and try again.',
  network_error: 'Could not reach the server. Check your connection.',
  internal_error: 'Something went wrong on our side. Please try again later.',
  unavailable: 'The service is temporarily unavailable. Please try again later.',
}

export function friendlyMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return ERROR_COPY[err.code] ?? ERROR_COPY['internal_error'] ?? 'Something went wrong.'
  }
  return ERROR_COPY['internal_error'] ?? 'Something went wrong.'
}
