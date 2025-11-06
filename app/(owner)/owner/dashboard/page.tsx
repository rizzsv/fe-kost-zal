"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AddKostBar from "@/components/ui/add-kost-bar"
import EditKostModal from "@/components/ui/edit-kost-modal"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Home, MessageSquare, LogOut, Search, RefreshCw } from "lucide-react"
import { DUMMY_BOOKINGS } from "@/lib/dummy-data"
import { useQuery, useMutation } from "@tanstack/react-query"

const API_URL = "https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_kos"

async function fetchKostList(searchQuery: string = "") {
  const token = localStorage.getItem("token")
  const url = searchQuery ? `${API_URL}?search=${encodeURIComponent(searchQuery)}` : API_URL
  
  const res = await fetch(url, {
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
      throw new Error(errorData.message || text || "Gagal memuat data kos")
    } catch {
      throw new Error(text || "Gagal memuat data kos")
    }
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Invalid response format")
  }
}

async function deleteKost(kosId: number) {
  const token = localStorage.getItem("token")
  const DELETE_URL = `https://learn.smktelkom-mlg.sch.id/kos/api/admin/delete_kos/${kosId}`
  
  console.log("Deleting kos ID:", kosId)
  console.log("Delete URL:", DELETE_URL)
  
  const res = await fetch(DELETE_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      makerID: "1",
      Authorization: `Bearer ${token}`,
    },
  })

  const text = await res.text()
  console.log("Delete kos response:", text)

  if (!res.ok) {
    try {
      const errorData = JSON.parse(text)
      throw new Error(errorData.message || text || "Gagal menghapus kos")
    } catch {
      throw new Error(text || "Gagal menghapus kos")
    }
  }

  try {
    return JSON.parse(text)
  } catch {
    return { success: true }
  }
}

export default function OwnerDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [editingKos, setEditingKos] = useState<any>(null)
  const router = useRouter()

  // Fetch kost data from API
  const { data: kostData, isLoading, error, refetch } = useQuery({
    queryKey: ["kostList", searchQuery],
    queryFn: () => fetchKostList(searchQuery),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  })

  const kosList = kostData?.data || []

  // Delete kost mutation
  const deleteMutation = useMutation({
    mutationFn: (kosId: number) => deleteKost(kosId),
    onSuccess: () => {
      alert("Kos berhasil dihapus!")
      refetch() // Refresh list after delete
    },
    onError: (error: Error) => {
      console.error("Error deleting kos:", error)
      alert(error.message || "Gagal menghapus kos")
    }
  })

  const handleDelete = (kos: any) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kos "${kos.name}"?`)) {
      deleteMutation.mutate(kos.id)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    router.push("/owner/login")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

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
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-orange-500 transition mt-auto"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
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
                          <td className="py-3">{kosList.find((k: any) => k.id === booking.kosId)?.name || "N/A"}</td>
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
              <div className="ml-4">
                <AddKostBar />
              </div>
            </div>

            {/* Search Bar */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Cari kos berdasarkan nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading}>
                    <Search className="w-4 h-4 mr-2" />
                    Cari
                  </Button>
                  <Button type="button" variant="outline" onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
                <p className="ml-3 text-gray-600">Memuat data kos...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-red-600 mb-4">
                    {(error as Error)?.message || "Gagal memuat data kos"}
                  </p>
                  <Button onClick={() => refetch()}>Coba Lagi</Button>
                </CardContent>
              </Card>
            )}

            {/* Kos List */}
            {!isLoading && !error && (
              <div className="grid gap-6">
                {kosList.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchQuery ? "Tidak ada kos yang ditemukan" : "Belum ada kos yang ditambahkan"}
                      </p>
                      {searchQuery && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("")
                            refetch()
                          }}
                          className="mt-4"
                        >
                          Reset Pencarian
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  kosList.map((kos: any) => (
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
                              <p className="text-gray-600">{kos.address}</p>
                              <p className="text-orange-600 font-semibold">
                                Rp {parseInt(kos.price_per_month || 0).toLocaleString("id-ID")}/bulan
                              </p>
                              <Badge variant="outline" className="mt-2">
                                {kos.gender === "male" ? "Laki-laki" : kos.gender === "female" ? "Perempuan" : "Campur"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingKos(kos)}
                              disabled={deleteMutation.status === 'pending'}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(kos)}
                              disabled={deleteMutation.status === 'pending'}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deleteMutation.status === 'pending' ? "Menghapus..." : "Hapus"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
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
                  {kosList.flatMap((kos: any) =>
                    (kos.comments || []).map((comment: any) => (
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
                  {kosList.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Belum ada ulasan</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Kost Modal */}
      {editingKos && (
        <EditKostModal
          kos={editingKos}
          onClose={() => setEditingKos(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}
