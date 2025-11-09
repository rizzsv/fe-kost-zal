// Environment configuration
export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://learn.smktelkom-mlg.sch.id/kos/api',
  // Admin token untuk society browsing kos (read-only)
  adminBrowseToken: process.env.NEXT_PUBLIC_ADMIN_BROWSE_TOKEN || '',
} as const

export default env
