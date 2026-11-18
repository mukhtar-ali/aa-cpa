/**
 * Cookie utility functions using manual document.cookie approach
 * Replaces js-cookie dependency for better consistency
 *
 * SECURITY NOTES:
 * - Cookies set from JavaScript cannot have httpOnly flag (backend limitation)
 * - For better security, consider having backend set httpOnly cookies instead
 * - These cookies use SameSite=Strict to prevent CSRF attacks
 * - Secure flag is set in production (HTTPS) only
 */

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * Check if the current connection is secure (HTTPS)
 */
function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.protocol === 'https:'
}

/**
 * Cookie names for authentication tokens
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'admin_access_token',
  REFRESH_TOKEN: 'admin_refresh_token',
} as const

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue
  }
  return undefined
}

/**
 * Set a cookie with security flags
 *
 * Security flags applied:
 * - SameSite=Strict: Prevents CSRF attacks by only sending cookies for same-site requests
 * - Secure: Cookie only sent over HTTPS (in production)
 * - Path=/: Cookie available throughout the site
 *
 * Note: httpOnly flag cannot be set from JavaScript (browser security limitation).
 * For httpOnly cookies, they must be set by the backend server.
 */
export function setCookie(
  name: string,
  value: string,
  maxAge: number = DEFAULT_MAX_AGE
): void {
  if (typeof document === 'undefined') return

  const isSecure = isSecureContext()
  const cookieAttributes = [
    `${name}=${value}`,
    'path=/',
    `max-age=${maxAge}`,
    'SameSite=Strict',
    isSecure ? 'Secure' : '', // Only add Secure flag over HTTPS
  ].filter(Boolean).join('; ')

  document.cookie = cookieAttributes
}

/**
 * Remove a cookie by setting its max age to 0
 * Must match the SameSite and Secure attributes to properly remove the cookie
 */
export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return

  const isSecure = isSecureContext()
  const cookieAttributes = [
    `${name}=`,
    'path=/',
    'max-age=0',
    'SameSite=Strict',
    isSecure ? 'Secure' : '', // Must match Secure flag to properly remove
  ].filter(Boolean).join('; ')

  document.cookie = cookieAttributes
}
