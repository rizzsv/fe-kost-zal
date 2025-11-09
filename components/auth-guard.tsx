"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserRole, isAuthenticated } from '@/lib/auth'
import type { UserRole } from '@/lib/auth'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole: UserRole
  fallbackPath: string
}

/**
 * AuthGuard component to protect routes based on user role
 * 
 * @param children - The content to render if authorized
 * @param requiredRole - The role required to access this route
 * @param fallbackPath - Where to redirect if unauthorized
 */
export function AuthGuard({ children, requiredRole, fallbackPath }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check authentication and role
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const userRole = getUserRole()

      console.log('🔐 Auth Check:', { authenticated, userRole, requiredRole })

      if (!authenticated) {
        console.log('❌ Not authenticated, redirecting to:', fallbackPath)
        router.replace(fallbackPath)
        return
      }

      if (userRole !== requiredRole) {
        console.log(`❌ Role mismatch. Required: ${requiredRole}, Got: ${userRole}`)
        
        // Show alert and redirect based on actual role
        if (userRole === 'owner') {
          alert('⚠️ Anda login sebagai Owner. Anda akan diarahkan ke dashboard Owner.')
          router.replace('/owner/dashboard')
        } else if (userRole === 'society') {
          alert('⚠️ Anda login sebagai Pengguna. Anda akan diarahkan ke halaman utama.')
          router.replace('/')
        } else {
          router.replace(fallbackPath)
        }
        return
      }

      console.log('✅ Authorized')
      setIsAuthorized(true)
      setIsChecking(false)
    }

    checkAuth()
  }, [requiredRole, fallbackPath, router])

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    )
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null
}

/**
 * Wrapper for Owner-only routes
 */
export function OwnerGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="owner" fallbackPath="/owner/login">
      {children}
    </AuthGuard>
  )
}

/**
 * Wrapper for Society-only routes
 */
export function SocietyGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="society" fallbackPath="/auth/login">
      {children}
    </AuthGuard>
  )
}
