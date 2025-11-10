"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Home, Search, Calendar, User, LogOut, Mail, Phone, Save, RefreshCw, MapPin, Clock } from "lucide-react"
import { getBookingHistory } from "@/lib/api/booking-api"
import { Badge } from "@/components/ui/badge"

const UPDATE_API_URL = "https://learn.smktelkom-mlg.sch.id/kos/api/society/update_profile"

type User = {
  id?: number | string
  name?: string
  email?: string
  phone?: string
}

export default function ProfileClient({ initialUser }: { initialUser: User }) {
  const [formData, setFormData] = useState({ name: initialUser?.name || "", email: initialUser?.email || "", phone: initialUser?.phone || "" })
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  // Fetch booking history
  const { data: bookingData, isLoading: bookingLoading } = useQuery({
    queryKey: ["bookingHistory"],
    queryFn: () => getBookingHistory(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false,
  })

  const bookings = bookingData || []

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
      throw new Error("Invalid response format")
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
    router.push("/auth/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const initials = getInitials(formData.name || initialUser?.name || "User")

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-screen flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              KH
            </div>
            <span className="font-bold text-xl">KostHunt</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <Link href="/dashboard">
            <button className="w-full px-6 py-3 flex items-center gap-3 transition text-gray-600 hover:bg-gray-50">
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
          </Link>

          <Link href="/">
            <button className="w-full px-6 py-3 flex items-center gap-3 transition text-gray-600 hover:bg-gray-50">
              <Search className="w-5 h-5" />
              <span className="font-medium">Cari Kos</span>
            </button>
          </Link>

          <Link href="/dashboard">
            <button className="w-full px-6 py-3 flex items-center gap-3 transition text-gray-600 hover:bg-gray-50">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Booking Saya</span>
            </button>
          </Link>

          <Link href="/profile">
            <button className="w-full px-6 py-3 flex items-center gap-3 transition bg-cyan-50 text-cyan-600 border-r-4 border-cyan-600">
              <User className="w-5 h-5" />
              <span className="font-medium">Profil</span>
            </button>
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t p-4">
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Logged in as</p>
            <p className="font-semibold text-sm">{formData.name || initialUser?.name || "User"}</p>
            <p className="text-xs text-gray-500">Pencari Kos</p>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
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
                    <User className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Nama Lengkap</p>
                      <p className="text-sm text-gray-900">{formData.name || initialUser?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm text-gray-900">{formData.email || initialUser?.email}</p>
                    </div>
                  </div>

                  {formData.phone && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
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

        {/* Booking History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Riwayat Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Memuat riwayat booking...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Belum ada booking</p>
                <p className="text-sm text-gray-400 mb-4">Mulai cari kos impian Anda sekarang!</p>
                <Link href="/">
                  <Button className="bg-cyan-600 hover:bg-cyan-700">Cari Kos</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div
                    key={booking.id_booking}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {booking.name || booking.kos?.name || `Kos ID: ${booking.kos_id}`}
                          </h3>
                          <Badge
                            variant={
                              booking.status === "accept"
                                ? "default"
                                : booking.status === "reject"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              booking.status === "accept"
                                ? "bg-green-500"
                                : booking.status === "reject"
                                  ? "bg-red-500"
                                  : "bg-yellow-500 text-white"
                            }
                          >
                            {booking.status === "accept"
                              ? "Diterima"
                              : booking.status === "reject"
                                ? "Ditolak"
                                : "Menunggu"}
                          </Badge>
                        </div>
                        {(booking.address || booking.kos?.address) && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{booking.address || booking.kos?.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(booking.start_date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <span>-</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(booking.end_date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {(booking.total_price || booking.price_per_month || booking.kos?.price_per_month) && (
                          <p className="text-lg font-bold text-cyan-600">
                            Rp {parseInt(booking.total_price || booking.price_per_month || booking.kos?.price_per_month || 0).toLocaleString("id-ID")}
                          </p>
                        )}
                        {!booking.total_price && (booking.price_per_month || booking.kos?.price_per_month) && (
                          <p className="text-xs text-gray-500">per bulan</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      {booking.status === "accept" && (
                        <Link href={`/nota/${booking.id_booking || booking.id}`}>
                          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                            Lihat Nota
                          </Button>
                        </Link>
                      )}
                      <Link href={`/kos/${booking.kos_id}`}>
                        <Button size="sm" variant="outline">
                          Detail Kos
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
