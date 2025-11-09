"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Search, Calendar, User, LogOut, MapPin, Clock, RefreshCw } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getBookingHistory } from "@/lib/api/booking-api"

export default function BookingSayaPage() {
  const router = useRouter()

  // Get current user
  const currentUser = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem("currentUser") || '{}') 
    : {}

  // Fetch all bookings (no filter)
  const { data: allBookings = [], isLoading: allLoading } = useQuery({
    queryKey: ["allBookings"],
    queryFn: () => getBookingHistory(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  })

  // Fetch pending bookings
  const { data: pendingBookings = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["pendingBookings"],
    queryFn: () => getBookingHistory("pending"),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  })

  // Fetch accepted bookings
  const { data: acceptedBookings = [] } = useQuery({
    queryKey: ["acceptedBookings"],
    queryFn: () => getBookingHistory("accept"),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  })

  // Fetch rejected bookings
  const { data: rejectedBookings = [] } = useQuery({
    queryKey: ["rejectedBookings"],
    queryFn: () => getBookingHistory("reject"),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  })

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
            <button className="w-full px-6 py-3 flex items-center gap-3 transition bg-cyan-50 text-cyan-600 border-r-4 border-cyan-600">
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
            <button className="w-full px-6 py-3 flex items-center gap-3 transition bg-cyan-50 text-cyan-600">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Booking Saya</span>
            </button>
          </Link>

          <Link href="/profile">
            <button className="w-full px-6 py-3 flex items-center gap-3 transition text-gray-600 hover:bg-gray-50">
              <User className="w-5 h-5" />
              <span className="font-medium">Profil</span>
            </button>
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t p-4">
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Logged in as</p>
            <p className="font-semibold text-sm">{currentUser.name || "User"}</p>
            <p className="text-xs text-gray-500">Pencari Kos</p>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {currentUser.name ? getInitials(currentUser.name) : "N"}
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
          <h1 className="text-3xl font-bold mb-2">My Booking</h1>
          <p className="text-gray-600 mb-8">View History</p>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Booking</p>
                    <p className="text-3xl font-bold text-blue-600">{allBookings.length}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Menunggu</p>
                    <p className="text-3xl font-bold text-yellow-600">{pendingBookings.length}</p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Diterima</p>
                    <p className="text-3xl font-bold text-green-600">{acceptedBookings.length}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Ditolak</p>
                    <p className="text-3xl font-bold text-red-600">{rejectedBookings.length}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Riwayat Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allLoading || pendingLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Memuat riwayat booking...</p>
                </div>
              ) : allBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Belum ada booking</p>
                  <p className="text-sm text-gray-400 mb-4">Mulai cari kos impian Anda sekarang!</p>
                  <Link href="/">
                    <Button className="bg-cyan-600 hover:bg-cyan-700">
                      <Search className="w-4 h-4 mr-2" />
                      Cari Kos
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {allBookings.map((booking: any) => (
                    <div
                      key={booking.id_booking}
                      className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{booking.name}</h3>
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
                                ? "✓ Diterima"
                                : booking.status === "reject"
                                  ? "✗ Ditolak"
                                  : "⏱ Menunggu"}
                            </Badge>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{booking.address}</span>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">Check-in:</span>
                              <span>
                                {new Date(booking.start_date).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">Check-out:</span>
                              <span>
                                {new Date(booking.end_date).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl font-bold text-cyan-600 mb-1">
                            Rp {parseInt(booking.price_per_month).toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs text-gray-500">per bulan</p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-3 border-t">
                        {booking.status === "accept" && (
                          <Link href={`/nota/${booking.id_booking}`}>
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
