"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/ui/user-nav"
import { useMutation, useQuery } from "@tanstack/react-query"
import { User, Mail, Phone, ArrowLeft, Save, RefreshCw } from "lucide-react"

const UPDATE_API_URL = "https://learn.smktelkom-mlg.sch.id/kos/api/society/update_profile"
const PROFILE_API_URL = "https://learn.smktelkom-mlg.sch.id/kos/api/society/profile"

async function fetchProfile() {
  const token = localStorage.getItem("token")
  const res = await fetch(PROFILE_API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      makerID: "1",
      Authorization: `Bearer ${token}`,
    },
  })

  const text = await res.text()

  if (!res.ok) {
    try {
      const errorData = JSON.parse(text)
      throw errorData
    } catch {
      throw new Error(text || "Failed to fetch profile")
    }
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Invalid response format")
  }
}

async function updateProfile(payload: { name: string; email: string; phone: string }) {
  const token = localStorage.getItem("token")
  const res = await fetch(UPDATE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      makerID: "1",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()

  if (!res.ok) {
    try {
      const errorData = JSON.parse(text)
      throw errorData
    } catch {
      throw new Error(text || "Update failed")
    }
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Invalid response format")
  }
}

export default function ProfilePage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" })
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  // Fetch profile data from API
  const { data: profileData, isLoading, error, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false, // Don't retry on 401
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    console.log("Current token:", token ? "exists" : "missing")
    
    if (!token) {
      console.log("No token, redirecting to login")
      router.push("/auth/login")
      return
    }

    // Update form when profile data is fetched
    if (profileData?.data) {
      const user = profileData.data
      console.log("Profile data fetched:", user)
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
      // Also update localStorage
      localStorage.setItem("currentUser", JSON.stringify(user))
    }
  }, [router, profileData])

  const mutation = useMutation({
    mutationFn: (data: { name: string; email: string; phone: string }) => updateProfile(data),
    onSuccess: (data) => {
      // update localStorage with new user data
      if (data.data) {
        localStorage.setItem("currentUser", JSON.stringify(data.data))
      }
      setIsEditing(false)
      refetch() // Refresh profile data
      alert("Profile berhasil diupdate!")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Handle authentication errors
  if (error) {
    console.error("Profile fetch error:", error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Gagal memuat profile. Silakan login ulang.</p>
            <Button onClick={() => router.push("/auth/login")}>Login Ulang</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentUser = profileData?.data

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Profile tidak ditemukan</p>
            <Button onClick={() => router.push("/auth/login")}>Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initials = currentUser.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            🏠 Kos Hunter
          </Link>
          <UserNav user={currentUser} />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                {initials}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{currentUser.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{currentUser.email}</p>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className="w-full"
              >
                {isEditing ? "Batal Edit" : "Edit Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Profile Details / Edit Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Profile" : "Informasi Profile"}</CardTitle>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Nama Lengkap</p>
                      <p className="text-sm text-gray-900">{currentUser.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm text-gray-900">{currentUser.email}</p>
                    </div>
                  </div>

                  {currentUser.phone && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">No. Telepon</p>
                        <p className="text-sm text-gray-900">{currentUser.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nama Lengkap</label>
                    <Input
                      placeholder="Nama Lengkap"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">No. Telepon</label>
                    <Input
                      placeholder="No. Telepon"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={mutation.status === "pending"}>
                    <Save className="w-4 h-4 mr-2" />
                    {mutation.status === "pending" ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>

                  {mutation.status === "error" && (
                    <p className="text-sm text-red-600 mt-2">
                      {(mutation.error as Error)?.message || "Gagal mengupdate profile"}
                    </p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
