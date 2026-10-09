import { describe, expect, it } from 'vitest'
import { ApiError, friendlyMessage } from './errors'

describe('ApiError.fromBody', () => {
  it('parses the backend envelope', () => {
    const err = ApiError.fromBody(422, {
      error: {
        code: 'validation_failed',
        message: 'Request validation failed',
        details: [{ location: 'body', field: '/items/0/qty', message: 'Required' }],
      },
    })
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(422)
    expect(err.code).toBe('validation_failed')
    expect(err.details).toHaveLength(1)
  })

  it('degrades gracefully on unknown shapes', () => {
    expect(ApiError.fromBody(500, null).code).toBe('http_error')
    expect(ApiError.fromBody(503, '<html>oops</html>').message).toBe('<html>oops</html>')
    expect(ApiError.fromBody(401, {}).code).toBe('http_error')
  })
})

describe('friendlyMessage', () => {
  it('maps known codes to copy, never raw messages', () => {
    const err = new ApiError(401, 'reauth_required', 'token too old for step-up')
    expect(friendlyMessage(err)).toBe('For your security, please verify it is you to continue.')
  })

  it('falls back for unknown codes and non-errors', () => {
    expect(friendlyMessage(new ApiError(500, 'mystery', 'x'))).toBe(
      'Something went wrong on our side. Please try again later.',
    )
    expect(friendlyMessage(new Error('boom'))).toBe('Something went wrong on our side. Please try again later.')
  })
})
