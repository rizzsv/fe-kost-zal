"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import OwnerProfileClient from "@/components/owner/profile-client"

export default function OwnerProfileFallback() {
  const [user, setUser] = useState<any | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser") || localStorage.getItem("user")
      const role = localStorage.getItem("userRole")
      if (raw) {
        const parsed = JSON.parse(raw)
        // if stored role exists and isn't owner, redirect to role-mismatch
        if (role && role !== "owner") {
          router.push(`/role-mismatch?expected=owner&actual=${encodeURIComponent(role)}`)
          return
        }
        setUser(parsed)
      } else {
        // No local user - redirect to login
        router.push("/owner/login")
      }
    } catch (err) {
      console.error("Failed to parse local user cookie fallback:", err)
      router.push("/owner/login")
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

  return <OwnerProfileClient initialUser={user} />
}
