"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProfileClient from "@/components/society/profile-client"

export default function ProfileFallback() {
  const [user, setUser] = useState<any | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser") || localStorage.getItem("user")
      if (raw) {
        const parsed = JSON.parse(raw)
        setUser(parsed)
      } else {
        // No local user - redirect to login
        router.push("/auth/login")
      }
    } catch (err) {
      console.error("Failed to parse local user cookie fallback:", err)
      router.push("/auth/login")
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Memuat profile...</p>
        </div>
      </div>
    )
  }

  return <ProfileClient initialUser={user} />
}
