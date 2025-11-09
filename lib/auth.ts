// Authentication helper functions

export interface AuthTokens {
  token: string
  makerId: string
  role?: string
}

export type UserRole = 'society' | 'owner'

/**
 * Save authentication tokens to localStorage
 */
export function saveAuthTokens(token: string, makerId: string = '1', role?: UserRole): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('authToken', token)
  localStorage.setItem('makerId', makerId)
  if (role) {
    localStorage.setItem('userRole', role)
  }
}

/**
 * Get authentication token from localStorage
 * Supports both 'authToken' (user) and 'token' (owner) keys
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  // Try 'authToken' first (user), then 'token' (owner)
  return localStorage.getItem('authToken') || localStorage.getItem('token')
}

/**
 * Get maker ID from localStorage
 */
export function getMakerId(): string {
  if (typeof window === 'undefined') return '1'
  return localStorage.getItem('makerId') || '1'
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

/**
 * Get user role from localStorage
 */
export function getUserRole(): UserRole | null {
  if (typeof window === 'undefined') return null
  const role = localStorage.getItem('userRole')
  return role as UserRole | null
}

/**
 * Check if user has specific role
 */
export function hasRole(role: UserRole): boolean {
  return getUserRole() === role
}

/**
 * Check if user is owner
 */
export function isOwner(): boolean {
  return hasRole('owner')
}

/**
 * Check if user is society
 */
export function isSociety(): boolean {
  return hasRole('society')
}

/**
 * Clear authentication tokens from localStorage
 */
export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('authToken')
  localStorage.removeItem('token')
  localStorage.removeItem('makerId')
  localStorage.removeItem('userRole')
}

/**
 * Save user data to localStorage
 */
export function saveCurrentUser(user: { name: string; email: string; id?: string }): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('currentUser', JSON.stringify(user))
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): { name: string; email: string; id?: string } | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

/**
 * Clear current user from localStorage
 */
export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('currentUser')
}

/**
 * Logout user - clear all auth data
 */
export function logout(): void {
  clearAuthTokens()
  clearCurrentUser()
}
