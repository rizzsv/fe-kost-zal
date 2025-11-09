import { cookies } from 'next/headers'

export type User = {
  id?: number | string
  name?: string
  email?: string
  phone?: string
  role?: string
}

// Server-side helper to read `user` cookie (set at login)
export async function getUser(): Promise<User | null> {
  // `cookies()` may return a promise in some runtimes; await to be safe
  const cookieStore = await cookies()
  const cookie = cookieStore.get?.('user') || (cookieStore as any).get?.('user')
  const user = cookie?.value
  return user ? JSON.parse(user) : null
}
