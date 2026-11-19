/**
 * Authentication Provider for Backend JWT Integration
 *
 * This provider wraps the application and supplies authentication context.
 * It uses the existing auth store for state management and provides
 * a clean API for authentication operations.
 *
 * Features:
 * - Provides authentication context via React Context
 * - Provides helper hooks for authentication state
 */
import { type ReactNode, createContext, useContext } from 'react'
import type { AuthStore } from '@/types/auth'
import { useAuthStore } from '@/stores/auth-store'
import { getCurrentUser } from '@/lib/auth-api'

interface AuthContextValue {
  auth: AuthStore
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export interface AuthProviderProps {
  children: ReactNode
}

/**
 * Authentication Provider Component
 *
 * Wraps the application to provide authentication context.
 *
 * Usage:
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthStore((state) => state.auth)

  /**
   * Refresh current user data from the backend
   * Useful for syncing user state after token refresh
   */
  const refreshUser = async (): Promise<void> => {
    if (!auth.accessToken) return

    try {
      const user = await getCurrentUser()
      auth.setUser(user)
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      // If we can't get user data, the session might be invalid
      auth.reset()
    }
  }

  // Token expiry is deliberately NOT handled here: the access token is short-lived and lib/api.ts silently renews it
  // from the httpOnly refresh cookie on the next 401. Clearing the session on expiry would log people out even
  // though their refresh cookie is still valid.

  const contextValue: AuthContextValue = {
    auth,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

/**
 * Hook to access authentication context
 *
 * Throws an error if used outside of AuthProvider.
 *
 * @returns AuthContextValue with auth store state and refreshUser function
 *
 * @example
 * ```tsx
 * const { auth, refreshUser } = useAuth()
 * const { user, accessToken, reset } = auth
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Hook to check if user is authenticated
 *
 * @returns boolean indicating if user has valid token
 */
export function useIsAuthenticated(): boolean {
  const { auth } = useAuth()
  return !!auth.accessToken && !!auth.user
}

/**
 * Hook to get current user
 *
 * @returns AuthUser or null if not authenticated
 */
export function useCurrentUser() {
  const { auth } = useAuth()
  return auth.user
}
