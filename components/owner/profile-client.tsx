"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"
import { Home, User, LogOut, Mail, Phone, Save } from "lucide-react"

const UPDATE_API_URL = "https://learn.smktelkom-mlg.sch.id/kos/api/admin/update_profile"
const PROFILE_API_URL = "https://learn.smktelkom-mlg.sch.id/kos/api/admin/profile"

type User = {
  id?: number | string
  name?: string
  email?: string
  phone?: string
}

export default function OwnerProfileClient({ initialUser }: { initialUser: User }) {
  const [formData, setFormData] = useState({ name: initialUser?.name || "", email: initialUser?.email || "", phone: initialUser?.phone || "" })
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  // Owner profile page: intentionally minimal. Booking history and dashboard links are removed here.

  useEffect(() => {
    // Update form when initialUser changes
    setFormData({ name: initialUser?.name || "", email: initialUser?.email || "", phone: initialUser?.phone || "" })
  }, [initialUser])

  async function updateProfile(payload: { name: string; email: string; phone: string }) {
    const token = localStorage.getItem("token")
    const res = await fetch(UPDATE_API_URL, {
      method: "PUT",
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
      // some backends may return an empty body on success; return a minimal success object
      return { success: true }
    }
  }

  const mutation = useMutation({
    mutationFn: (data: { name: string; email: string; phone: string }) => updateProfile(data),
    onSuccess: (data) => {
      // update localStorage with new user data
      if (data.data) {
        localStorage.setItem("currentUser", JSON.stringify(data.data))
      }
      setIsEditing(false)
      alert("Profile berhasil diupdate!")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("currentUser")
    router.push("/owner/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const initials = getInitials(formData.name || initialUser?.name || "Owner")

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-screen flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              KH
            </div>
            <span className="font-bold text-xl">KostHunt</span>
          </div>
        </div>

        {/* Navigation (owner-specific) */}
        <nav className="flex-1 py-6">
          <Link href="/owner/dashboard">
            <button className="w-full px-6 py-3 flex items-center gap-3 transition text-gray-600 hover:bg-gray-50">
              <Home className="w-5 h-5" />
              <span className="font-medium">Kelola Kos</span>
            </button>
          </Link>

          <Link href="/owner/profile">
            <button className="w-full px-6 py-3 flex items-center gap-3 transition bg-orange-50 text-orange-600 border-r-4 border-orange-600">
              <User className="w-5 h-5" />
              <span className="font-medium">Profil</span>
            </button>
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t p-4">
          <div className="mb-3">
            <p className="text-xs text-gray-200 mb-1">Logged in as</p>
            <p className="font-semibold text-sm">{formData.name || initialUser?.name || "Owner"}</p>
            <p className="text-xs text-gray-200">Pemilik Kost</p>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Profil Saya</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                {initials}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{formData.name || initialUser?.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{formData.email || initialUser?.email}</p>
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
                    <User className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Nama Lengkap</p>
                      <p className="text-sm text-gray-900">{formData.name || initialUser?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm text-gray-900">{formData.email || initialUser?.email}</p>
                    </div>
                  </div>

                  {formData.phone && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">No. Telepon</p>
                        <p className="text-sm text-gray-900">{formData.phone}</p>
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

        {/* Booking history removed from owner profile view per design preference */}
        </div>
      </div>
    </div>
  )
}
