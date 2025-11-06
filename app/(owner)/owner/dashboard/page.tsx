"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Home, MessageSquare, LogOut } from "lucide-react"
import { DUMMY_BOOKINGS, DUMMY_KOS } from "@/lib/dummy-data"

export default function OwnerDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const totalBookings = DUMMY_BOOKINGS.length
  const acceptedBookings = DUMMY_BOOKINGS.filter((b) => b.status === "accepted").length
  const pendingBookings = DUMMY_BOOKINGS.filter((b) => b.status === "pending").length
  const totalRevenue = DUMMY_BOOKINGS.filter((b) => b.status === "accepted").reduce((sum, b) => sum + b.total, 0)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-orange-600 to-orange-700 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold">🏠 Kos Hunter</h1>
          <p className="text-orange-100 text-sm">Owner Panel</p>
        </div>

        <nav className="mt-8">
          {[
            { id: "overview", icon: BarChart3, label: "Overview" },
            { id: "kos", icon: Home, label: "Manajemen Kos" },
            { id: "bookings", icon: Users, label: "Pemesanan" },
            { id: "reviews", icon: MessageSquare, label: "Ulasan" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full px-6 py-3 flex items-center gap-3 transition ${
                activeTab === item.id ? "bg-orange-500" : "hover:bg-orange-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
          <Link
            href="/auth/login"
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-orange-500 transition mt-auto"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600 text-sm">Total Pemesanan</p>
                  <p className="text-3xl font-bold text-orange-600">{totalBookings}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600 text-sm">Diterima</p>
                  <p className="text-3xl font-bold text-green-600">{acceptedBookings}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600 text-sm">Menunggu</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingBookings}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600 text-sm">Total Pendapatan</p>
                  <p className="text-xl font-bold text-blue-600">Rp {(totalRevenue / 1000000).toFixed(1)}jt</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Pemesanan Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold">No.</th>
                        <th className="text-left py-2 font-semibold">Kos</th>
                        <th className="text-left py-2 font-semibold">Durasi</th>
                        <th className="text-left py-2 font-semibold">Total</th>
                        <th className="text-left py-2 font-semibold">Status</th>
                        <th className="text-left py-2 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DUMMY_BOOKINGS.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">KH-{String(booking.id).padStart(4, "0")}</td>
                          <td className="py-3">{DUMMY_KOS.find((k) => k.id === booking.kosId)?.name}</td>
                          <td className="py-3">{booking.duration} bulan</td>
                          <td className="py-3 font-semibold">Rp {booking.total.toLocaleString("id-ID")}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                booking.status === "accepted"
                                  ? "default"
                                  : booking.status === "rejected"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {booking.status === "accepted"
                                ? "Diterima"
                                : booking.status === "rejected"
                                  ? "Ditolak"
                                  : "Menunggu"}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Button size="sm" variant="ghost">
                              Detail
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "kos" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Manajemen Kos</h2>
              <Button className="bg-orange-600 hover:bg-orange-700">+ Tambah Kos</Button>
            </div>

            <div className="grid gap-6">
              {DUMMY_KOS.map((kos) => (
                <Card key={kos.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 flex-1">
                        <img
                          src={kos.image || "/placeholder.svg"}
                          alt={kos.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-bold text-lg">{kos.name}</h3>
                          <p className="text-gray-600">{kos.location}</p>
                          <p className="text-orange-600 font-semibold">Rp {kos.price.toLocaleString("id-ID")}/bulan</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Hapus
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm">
                        <span className="font-semibold">Kamar Tersedia:</span>{" "}
                        {kos.rooms.filter((r) => r.available).length} / {kos.rooms.length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Kelola Pemesanan</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {DUMMY_BOOKINGS.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold">KH-{String(booking.id).padStart(4, "0")}</p>
                          <p className="text-sm text-gray-600">{new Date(booking.date).toLocaleDateString("id-ID")}</p>
                        </div>
                        <Badge
                          variant={
                            booking.status === "accepted"
                              ? "default"
                              : booking.status === "rejected"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {booking.status === "accepted"
                            ? "Diterima"
                            : booking.status === "rejected"
                              ? "Ditolak"
                              : "Menunggu"}
                        </Badge>
                      </div>
                      {booking.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Terima
                          </Button>
                          <Button size="sm" variant="destructive">
                            Tolak
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Ulasan & Komentar</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {DUMMY_KOS.flatMap((kos) =>
                    kos.comments.map((comment) => (
                      <div key={comment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold">{comment.author}</p>
                            <p className="text-sm text-gray-600">{comment.date}</p>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < comment.rating ? "text-yellow-500" : "text-gray-300"}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{comment.text}</p>
                        <input
                          type="text"
                          placeholder="Balas komentar..."
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                    )),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
