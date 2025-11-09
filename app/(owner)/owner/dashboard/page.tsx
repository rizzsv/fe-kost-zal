"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AddKostBar from "@/components/ui/add-kost-bar"
import EditKostModal from "@/components/ui/edit-kost-modal"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Home, MessageSquare, LogOut, Search, RefreshCw, Settings } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getOwnerReviews, addOwnerReply } from "@/lib/api/review-api"
import { fetchKosList, getKosImageUrl } from "@/lib/api/kos-api"
import { getOwnerBookings, BookingData, updateBookingStatusByOwner } from "@/lib/api/booking-api"

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
  const DELETE_URL = `https://learn.smktelkom-mlg.sch.id/kostoken/api/admin/delete_kos/${kosId}`
  
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
  const [selectedKosForReviews, setSelectedKosForReviews] = useState<number | null>(null)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState<Record<number, string>>({})
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Load currentUser from localStorage as a client-side fallback
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("currentUser")
        if (raw) {
          setCurrentUser(JSON.parse(raw))
        }
      }
    } catch (err) {
      console.warn("Failed to parse currentUser from localStorage", err)
      setCurrentUser(null)
    }
  }, [])

  // Fetch kost data from API
  const { data: kostData, isLoading, error, refetch } = useQuery({
    queryKey: ["kostList", searchQuery],
    queryFn: () => fetchKostList(searchQuery),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  })

  const kosList = kostData?.data || []

  // Fetch bookings data from API
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["ownerBookings"],
    queryFn: async () => {
      console.log('🔍 Fetching owner bookings from dashboard...')
      const data = await getOwnerBookings()
      console.log('📦 Owner bookings received:', data)
      return data
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  })

  const bookingsList = bookingsData || []
  
  console.log('📊 Dashboard bookingsList:', bookingsList)
  console.log('📊 Dashboard bookingsList length:', bookingsList.length)

  // Fetch all reviews for overview statistics
  const { data: allReviewsData } = useQuery({
    queryKey: ["allOwnerReviews"],
    queryFn: async () => {
      // Get reviews for all kos owned by this owner
      if (kosList.length === 0) return []
      
      const allReviews = await Promise.all(
        kosList.map(async (kos: any) => {
          try {
            const reviews = await getOwnerReviews(kos.id)
            return {
              kosId: kos.id,
              kosName: kos.name,
              reviews: reviews || []
            }
          } catch {
            return {
              kosId: kos.id,
              kosName: kos.name,
              reviews: []
            }
          }
        })
      )
      
      return allReviews
    },
    enabled: kosList.length > 0 && activeTab === "overview",
  })

  // Fetch reviews for selected kos
  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
    queryKey: ["ownerReviews", selectedKosForReviews],
    queryFn: () => getOwnerReviews(selectedKosForReviews!),
    enabled: !!selectedKosForReviews && activeTab === "reviews",
  })

  const reviewsList = reviewsData || []

  // Group reviews: Identify owner replies and nest them under society reviews
  const groupedReviews = useMemo(() => {
    if (!reviewsList || reviewsList.length === 0) return []

    console.log('🔍 All reviews (Owner Dashboard):', reviewsList)

    // Get current owner user ID (the one who's logged in)
    const currentOwnerUserId = localStorage.getItem('currentUser') ? 
      JSON.parse(localStorage.getItem('currentUser') || '{}').id : null
    
    console.log('👤 Current owner user_id:', currentOwnerUserId)

    // Also get the kos owner from selected kos
    const selectedKosData = kosList.find((k: any) => k.id === selectedKosForReviews)
    const kosOwnerUserId = selectedKosData?.user_id

    console.log('📍 Selected kos owner user_id:', kosOwnerUserId)

    // Separate society reviews and owner replies
    const societyReviews: Array<any & { replies: any[] }> = []
    const ownerReplies: any[] = []

    reviewsList.forEach((review: any) => {
      console.log('Review:', {
        id: review.id,
        user_id: review.user_id,
        comment: review.comment?.substring(0, 20) + '...',
        created_at: review.created_at
      })

      // Owner reply adalah:
      // 1. Review dari current logged-in owner
      // 2. ATAU review dari pemilik kos ini
      const isOwnerReply = 
        review.user_id === currentOwnerUserId ||
        review.user_id === kosOwnerUserId

      if (isOwnerReply) {
        console.log('✅ OWNER REPLY detected! (user_id:', review.user_id, ')')
        ownerReplies.push(review)
      } else {
        console.log('✅ SOCIETY REVIEW (user_id:', review.user_id, ')')
        societyReviews.push({
          ...review,
          replies: [] // Initialize empty replies array
        })
      }
    })

    console.log('📊 Society Reviews:', societyReviews.length)
    console.log('📊 Owner Replies:', ownerReplies.length)

    // Try to match owner replies with society reviews (by sorting and proximity)
    // This is a heuristic: owner reply typically comes after the review it's replying to
    ownerReplies.forEach((reply) => {
      // Find the most recent society review before this reply
      const replyTime = new Date(reply.created_at).getTime()
      
      let closestReview: (any & { replies: any[] }) | null = null
      let minTimeDiff = Infinity
      
      societyReviews.forEach((review) => {
        const reviewTime = new Date(review.created_at).getTime()
        const timeDiff = replyTime - reviewTime
        
        // Only consider reviews that came before this reply
        if (timeDiff > 0 && timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff
          closestReview = review
        }
      })
      
      // If found a match, add as nested reply
      if (closestReview) {
        console.log(`💬 Matching reply ${reply.id} with review ${closestReview.id}`)
        closestReview.replies.push(reply)
      } else {
        console.log(`⚠️ No match found for reply ${reply.id}`)
      }
    })

    console.log('📦 Final grouped reviews:', societyReviews)

    return societyReviews
  }, [reviewsList, selectedKosForReviews, kosList])

  // Auto-select first kos when reviews tab is opened
  useEffect(() => {
    if (activeTab === "reviews" && kosList.length > 0 && !selectedKosForReviews) {
      setSelectedKosForReviews(kosList[0].id)
    }
  }, [activeTab, kosList, selectedKosForReviews])

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

  // Reply to review mutation
  const replyMutation = useMutation({
    mutationFn: ({ kosId, text, reviewId }: { kosId: number; text: string; reviewId?: number }) => addOwnerReply(kosId, text),
    onSuccess: (data, variables) => {
      alert("✅ Balasan berhasil dikirim!")
      
      // Update local state to add nested reply immediately (optimistic update)
      if (selectedKosForReviews && variables.reviewId) {
        queryClient.setQueryData(["ownerReviews", selectedKosForReviews], (oldData: any) => {
          if (!oldData) return oldData
          
          // Add reply to the specific review
          return oldData.map((review: any) => {
            if (review.id === variables.reviewId) {
              const newReply = {
                id: Date.now(),
                kos_id: selectedKosForReviews,
                user_id: 0,
                comment: variables.text,
                created_at: new Date().toISOString(),
                user_name: "Owner"
              }
              return {
                ...review,
                replies: [...(review.replies || []), newReply]
              }
            }
            return review
          })
        })
      }
      
      setReplyingTo(null)
      setReplyText({})
      
      // Still refetch to get actual data from server
      if (selectedKosForReviews) {
        setTimeout(() => {
          refetchReviews()
        }, 500)
      }
    },
    onError: (error: Error) => {
      console.error("Error adding reply:", error)
      alert(error.message || "Gagal mengirim balasan")
    }
  })

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: number; status: 'accept' | 'reject' }) => 
      updateBookingStatusByOwner(bookingId, status),
    onSuccess: (data, variables) => {
      const statusText = variables.status === 'accept' ? 'diterima' : 'ditolak'
      alert(`✅ Pemesanan berhasil ${statusText}!`)
      
      // Refetch bookings to get updated data
      queryClient.invalidateQueries({ queryKey: ["ownerBookings"] })
    },
    onError: (error: Error) => {
      console.error("Error updating booking status:", error)
      alert(error.message || "Gagal mengubah status pemesanan")
    }
  })

  const handleDelete = (kos: any) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kos "${kos.name}"?`)) {
      deleteMutation.mutate(kos.id)
    }
  }

  const handleLogout = () => {
    // Clear all auth data properly
    localStorage.removeItem("token")
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("currentUser")
    router.push("/owner/login")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  const handleReply = (reviewId: number) => {
    if (!selectedKosForReviews) return
    const text = replyText[reviewId]
    if (!text || !text.trim()) {
      alert("Balasan tidak boleh kosong!")
      return
    }
    // Tambahkan reply ke state lokal sebagai nested reply
    replyMutation.mutate({ 
      kosId: selectedKosForReviews, 
      text: text.trim(),
      reviewId  // Pass reviewId untuk tracking
    })
  }

  const handleReplyTextChange = (reviewId: number, text: string) => {
    setReplyText(prev => ({ ...prev, [reviewId]: text }))
  }

  const handleAcceptBooking = (bookingId: number, kosName: string) => {
    if (window.confirm(`Terima pemesanan untuk kos "${kosName}"?`)) {
      updateBookingMutation.mutate({ bookingId, status: 'accept' })
    }
  }

  const handleRejectBooking = (bookingId: number, kosName: string) => {
    if (window.confirm(`Tolak pemesanan untuk kos "${kosName}"?`)) {
      updateBookingMutation.mutate({ bookingId, status: 'reject' })
    }
  }

  // Calculate booking statistics from API data
  const totalBookings = bookingsList.length
  const acceptedBookings = bookingsList.filter((b) => b.status === "accept").length
  const pendingBookings = bookingsList.filter((b) => b.status === "pending").length
  
  // Calculate total revenue from accepted bookings
  const totalRevenue = bookingsList
    .filter((b) => b.status === "accept")
    .reduce((sum, b) => {
      const price = typeof b.price_per_month === 'string' ? parseInt(b.price_per_month) : (b.price_per_month || 0)
      return sum + price
    }, 0)

  // Calculate statistics from API data
  const totalKos = kosList.length
  const totalRooms = kosList.reduce((sum: number, kos: any) => sum + (kos.available_rooms || 0), 0)
  
  // Calculate total reviews across all kos
  const totalReviews = allReviewsData?.reduce((sum: number, kos: any) => sum + kos.reviews.length, 0) || 0
  
  // Calculate average rating if reviews have ratings
  const reviewsWithRating = allReviewsData?.flatMap((kos: any) => 
    kos.reviews.filter((r: any) => r.rating)
  ) || []
  const avgRating = reviewsWithRating.length > 0
    ? (reviewsWithRating.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsWithRating.length).toFixed(1)
    : 0

  // Get most reviewed kos
  const mostReviewedKos = allReviewsData && allReviewsData.length > 0
    ? [...allReviewsData].sort((a, b) => b.reviews.length - a.reviews.length)[0]
    : null

  // Get recent reviews across all kos
  const recentReviews = allReviewsData
    ?.flatMap((kos: any) => 
      kos.reviews.map((r: any) => ({
        ...r,
        kosName: kos.kosName,
        kosId: kos.kosId
      }))
    )
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) || []

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-orange-600 to-orange-700 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold">🏠 Kos Hunter</h1>
          <p className="text-orange-100 text-sm">Owner Panel</p>

          {/* Compact owner profile (client-side fallback using localStorage) */}
          {currentUser ? (
            <div className="mt-4 p-3 bg-white/10 rounded">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center text-white font-bold">
                  {currentUser.name ? String(currentUser.name)[0].toUpperCase() : (currentUser.user_name ? String(currentUser.user_name)[0].toUpperCase() : "O")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{currentUser.name || currentUser.user_name || currentUser.full_name || "Owner"}</p>
                  <p className="text-xs">{currentUser.email || currentUser.user_email || ""}</p>
                  <Link href="/owner/profile" className="text-xs text-orange-100 mt-1 inline-block">Lihat Profil</Link>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/owner/login" className="mt-4 block text-sm text-orange-100">Masuk sebagai Owner</Link>
          )}
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
          
          {/* Link to Facilities Page */}
          <Link href="/owner/facilities" className="block">
            <button
              className="w-full px-6 py-3 flex items-center gap-3 hover:bg-orange-500 transition"
            >
              <Settings className="w-5 h-5" />
              Kelola Fasilitas
            </button>
          </Link>
          
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
            <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
            
            {/* Booking Statistics */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">📈 Statistik Pemesanan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      {bookingsList.slice(0, 5).map((booking) => (
                        <tr key={booking.id_booking} className="border-b hover:bg-gray-50">
                          <td className="py-3">KH-{String(booking.id_booking).padStart(4, "0")}</td>
                          <td className="py-3">{booking.name || kosList.find((k: any) => k.id === booking.kos_id)?.name || "N/A"}</td>
                          <td className="py-3">
                            {Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} bulan
                          </td>
                          <td className="py-3 font-semibold">
                            Rp {(typeof booking.price_per_month === 'string' ? parseInt(booking.price_per_month) : booking.price_per_month || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                booking.status === "accept"
                                  ? "default"
                                  : booking.status === "reject"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {booking.status === "accept"
                                ? "Diterima"
                                : booking.status === "reject"
                                  ? "Ditolak"
                                  : "Menunggu"}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Button size="sm" variant="ghost" onClick={() => router.push(`/owner/bookings`)}>
                              Detail
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {bookingsList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            Belum ada pemesanan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Kos Statistics - Moved after booking */}
            <div className="mt-8 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">📊 Statistik Kos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Total Kos</p>
                        <p className="text-3xl font-bold text-orange-600">{totalKos}</p>
                      </div>
                      <Home className="w-12 h-12 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Total Ulasan</p>
                        <p className="text-3xl font-bold text-blue-600">{totalReviews}</p>
                      </div>
                      <MessageSquare className="w-12 h-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Rating Rata-rata</p>
                        <p className="text-3xl font-bold text-yellow-600">
                          {avgRating || "N/A"}
                          {Number(avgRating) > 0 && <span className="text-lg"> ★</span>}
                        </p>
                      </div>
                      <BarChart3 className="w-12 h-12 text-yellow-200" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Total Kamar</p>
                        <p className="text-3xl font-bold text-green-600">{totalRooms || "N/A"}</p>
                      </div>
                      <Users className="w-12 h-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Kos List dengan Detail */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">🏠 Daftar Kos Anda</h3>
              {isLoading ? (
                <Card>
                  <CardContent className="p-6 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-orange-600 animate-spin mr-2" />
                    <span className="text-gray-600">Memuat data kos...</span>
                  </CardContent>
                </Card>
              ) : kosList.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada kos yang ditambahkan</p>
                    <div className="mt-4">
                      <AddKostBar />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {kosList.map((kos: any) => {
                    const kosReviews = allReviewsData?.find((kr: any) => kr.kosId === kos.id)?.reviews || []
                    const kosRating = kosReviews.filter((r: any) => r.rating).length > 0
                      ? (kosReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / kosReviews.filter((r: any) => r.rating).length).toFixed(1)
                      : null
                    
                    // Get image URL properly
                    let imageUrl = "/placeholder.svg"
                    if (kos.kos_image && kos.kos_image.length > 0) {
                      imageUrl = getKosImageUrl(kos.kos_image[0])
                      console.log('🏠 Owner - Kos:', kos.name, 'Using kos_image:', imageUrl)
                    } else if (kos.image) {
                      if (kos.image.startsWith('http')) {
                        imageUrl = kos.image
                      } else {
                        const cleanImage = kos.image.startsWith('/') ? kos.image.slice(1) : kos.image
                        imageUrl = `https://learn.smktelkom-mlg.sch.id/kos/${cleanImage}`
                      }
                      console.log('🏠 Owner - Kos:', kos.name, 'Using legacy image:', imageUrl)
                    } else {
                      console.warn('⚠️ Owner - Kos:', kos.name, 'No image data available:', { kos_image: kos.kos_image, image: kos.image })
                    }
                    
                    return (
                      <Card key={kos.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <img
                              src={imageUrl}
                              alt={kos.name}
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                console.error('❌ Owner dashboard - Image failed:', imageUrl)
                                const currentSrc = e.currentTarget.src
                                if (currentSrc.includes('/storage/')) {
                                  e.currentTarget.src = currentSrc.replace('/storage/', '/')
                                } else if (!currentSrc.includes('placeholder')) {
                                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext fill='%239ca3af' font-size='12' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"
                                }
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-lg mb-1">{kos.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{kos.address}</p>
                              <p className="text-orange-600 font-semibold mb-2">
                                Rp {parseInt(kos.price_per_month || 0).toLocaleString("id-ID")}/bulan
                              </p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge variant="outline">
                                  {kos.gender === "male" ? "Laki-laki" : kos.gender === "female" ? "Perempuan" : "Campur"}
                                </Badge>
                                {kosRating && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <span className="text-yellow-500">★</span>
                                    <span className="font-semibold">{kosRating}</span>
                                  </div>
                                )}
                                <span className="text-sm text-gray-600">
                                  💬 {kosReviews.length} ulasan
                                </span>
                              </div>
                              {kos.kos_facilities && kos.kos_facilities.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">Fasilitas:</p>
                                  <div className="flex gap-1 flex-wrap">
                                    {kos.kos_facilities.slice(0, 3).map((facility: any) => (
                                      <span key={facility.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {facility.facility_name}
                                      </span>
                                    ))}
                                    {kos.kos_facilities.length > 3 && (
                                      <span className="text-xs text-gray-500">
                                        +{kos.kos_facilities.length - 3} lainnya
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Most Reviewed Kos */}
            {mostReviewedKos && mostReviewedKos.reviews.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">🏆 Kos Paling Banyak Diulas</h3>
                <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        🏆
                      </div>
                      <div>
                        <h4 className="text-lg font-bold">{mostReviewedKos.kosName}</h4>
                        <p className="text-gray-600">
                          {mostReviewedKos.reviews.length} ulasan dari penghuni
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Reviews with Nested UI */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">💬 Ulasan Terbaru</h3>
              <Card>
                <CardContent className="p-6">
                  {recentReviews.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Belum ada ulasan</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {recentReviews.map((review: any) => {
                        // Find if this review has owner replies
                        const ownerReplies = allReviewsData
                          ?.flatMap((kos: any) => kos.reviews)
                          .filter((r: any) => {
                            const currentOwnerUserId = localStorage.getItem('currentUser') ? 
                              JSON.parse(localStorage.getItem('currentUser') || '{}').id : null
                            const isOwnerReply = r.user_id === currentOwnerUserId
                            const replyTime = new Date(r.created_at).getTime()
                            const reviewTime = new Date(review.created_at).getTime()
                            const timeDiff = replyTime - reviewTime
                            
                            // Owner reply that came after this review within reasonable time (e.g., 1 hour)
                            return isOwnerReply && timeDiff > 0 && timeDiff < 3600000
                          }) || []

                        return (
                          <div key={review.id} className="border rounded-lg p-4 bg-white">
                            {/* Main Society Review */}
                            <div className="flex gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {review.user_name ? review.user_name[0].toUpperCase() : "U"}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <p className="font-semibold text-sm">{review.user_name || `User #${review.user_id}`}</p>
                                    <p className="text-xs text-orange-600 font-medium">{review.kosName}</p>
                                  </div>
                                  <div className="text-right">
                                    {review.rating && (
                                      <div className="flex mb-1">
                                        {[...Array(5)].map((_, i) => (
                                          <span key={i} className={`text-sm ${i < review.rating ? "text-yellow-500" : "text-gray-300"}`}>
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      {new Date(review.created_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-gray-700 text-sm mt-2">{review.comment}</p>
                              </div>
                            </div>

                            {/* Nested Owner Replies */}
                            {ownerReplies.length > 0 && (
                              <div className="mt-3 pl-10 border-l-2 border-orange-200 ml-5 space-y-2">
                                {ownerReplies.map((reply: any, index: number) => (
                                  <div key={reply.id || index} className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-lg p-3 shadow-sm">
                                    <div className="flex gap-2">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                        O
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="font-bold text-sm text-orange-700">Owner</p>
                                          <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-semibold rounded-full">
                                            Balasan
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">
                                          {new Date(reply.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                          })}
                                        </p>
                                        <p className="text-gray-800 text-sm leading-relaxed">{reply.comment}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
                  kosList.map((kos: any) => {
                    // Get image URL properly for overview tab
                    let imageUrl = "/placeholder.svg"
                    if (kos.kos_image && kos.kos_image.length > 0) {
                      imageUrl = getKosImageUrl(kos.kos_image[0])
                    } else if (kos.image) {
                      if (kos.image.startsWith('http')) {
                        imageUrl = kos.image
                      } else {
                        const cleanImage = kos.image.startsWith('/') ? kos.image.slice(1) : kos.image
                        imageUrl = `https://learn.smktelkom-mlg.sch.id/kos/${cleanImage}`
                      }
                    }
                    
                    return (
                    <Card key={kos.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4 flex-1">
                            <img
                              src={imageUrl}
                              alt={kos.name}
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                console.error('❌ Owner overview - Image failed:', imageUrl)
                                const currentSrc = e.currentTarget.src
                                if (currentSrc.includes('/storage/')) {
                                  e.currentTarget.src = currentSrc.replace('/storage/', '/')
                                } else if (!currentSrc.includes('placeholder')) {
                                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext fill='%239ca3af' font-size='12' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"
                                }
                              }}
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
                  )
                  })
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">Kelola Pemesanan</h2>
                <p className="text-gray-600 mt-1">
                  Total {bookingsList.length} pemesanan dari {[...new Set(bookingsList.map(b => b.kos_id))].length} kos
                </p>
              </div>
              <Link href="/owner/bookings">
                <Button variant="outline">
                  Lihat Semua & Filter
                </Button>
              </Link>
            </div>
            <Card>
              <CardContent className="p-6">
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
                    <p className="ml-3 text-gray-600">Memuat pemesanan...</p>
                  </div>
                ) : bookingsList.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Belum ada pemesanan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookingsList.slice(0, 10).map((booking) => (
                      <div key={booking.id_booking} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold">KH-{String(booking.id_booking).padStart(4, "0")}</p>
                            <p className="text-sm text-gray-600">{new Date(booking.start_date).toLocaleDateString("id-ID")}</p>
                            <p className="text-sm text-gray-700 mt-1">{booking.name}</p>
                            <p className="text-xs text-gray-500">{booking.address}</p>
                          </div>
                          <Badge
                            variant={
                              booking.status === "accept"
                                ? "default"
                                : booking.status === "reject"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {booking.status === "accept"
                              ? "Diterima"
                              : booking.status === "reject"
                                ? "Ditolak"
                                : "Menunggu"}
                          </Badge>
                        </div>
                        {booking.status === "pending" && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAcceptBooking(booking.id_booking, booking.name || 'kos ini')}
                              disabled={updateBookingMutation.isPending}
                            >
                              {updateBookingMutation.isPending ? 'Loading...' : 'Terima'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRejectBooking(booking.id_booking, booking.name || 'kos ini')}
                              disabled={updateBookingMutation.isPending}
                            >
                              {updateBookingMutation.isPending ? 'Loading...' : 'Tolak'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {bookingsList.length > 10 && (
                      <div className="mt-4 pt-4 border-t text-center">
                        <p className="text-sm text-gray-600 mb-3">
                          Menampilkan 10 dari {bookingsList.length} pemesanan
                        </p>
                        <Link href="/owner/bookings">
                          <Button variant="outline" size="sm">
                            Lihat Semua Pemesanan →
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Ulasan & Komentar</h2>
            
            {/* Kos Selection */}
            {kosList.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Kos untuk Melihat Ulasan:
                  </label>
                  <select
                    value={selectedKosForReviews || ""}
                    onChange={(e) => setSelectedKosForReviews(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">-- Pilih Kos --</option>
                    {kosList.map((kos: any) => (
                      <option key={kos.id} value={kos.id}>
                        {kos.name}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <Card>
              <CardContent className="p-6">
                {!selectedKosForReviews ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Pilih kos untuk melihat ulasan</p>
                  </div>
                ) : reviewsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
                    <p className="ml-3 text-gray-600">Memuat ulasan...</p>
                  </div>
                ) : reviewsList.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada ulasan untuk kos ini</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedReviews.map((review: any) => (
                      <div key={review.id} className="border rounded-lg p-4 bg-white">
                        {/* Main Review */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                              {review.user_name ? review.user_name[0].toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="font-bold">
                                {review.user_name || `User #${review.user_id}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(review.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          {review.rating && (
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3 ml-13">{review.comment}</p>
                        
                        {/* Reply Form */}
                        {replyingTo === review.id ? (
                          <div className="ml-13 bg-gray-50 border-l-4 border-orange-500 p-3 rounded">
                            <div className="flex gap-2 items-start">
                              <textarea
                                placeholder="Tulis balasan Anda..."
                                value={replyText[review.id] || ""}
                                onChange={(e) => handleReplyTextChange(review.id, e.target.value)}
                                className="flex-1 border rounded px-3 py-2 text-sm resize-none"
                                rows={3}
                                autoFocus
                                disabled={replyMutation.status === 'pending'}
                              />
                            </div>
                            <div className="flex gap-2 mt-2 justify-end">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setReplyingTo(null)
                                  handleReplyTextChange(review.id, "")
                                }}
                                disabled={replyMutation.status === 'pending'}
                              >
                                Batal
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleReply(review.id)}
                                disabled={replyMutation.status === 'pending' || !replyText[review.id]?.trim()}
                              >
                                {replyMutation.status === 'pending' ? "Mengirim..." : "Kirim Balasan"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="ml-13">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setReplyingTo(review.id)}
                              disabled={replyMutation.status === 'pending'}
                            >
                              💬 Balas
                            </Button>
                          </div>
                        )}

                        {/* Nested Replies - Muncul di bawah review yang sama */}
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-3">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                              💬 Balasan Owner
                            </p>
                            {review.replies.map((reply: any, index: number) => (
                              <div key={reply.id || index} className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-lg p-4 shadow-sm">
                                <div className="flex gap-3">
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                                    O
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-bold text-orange-700">Owner</p>
                                      <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-semibold rounded-full">
                                        Balasan
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">
                                      {new Date(reply.created_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                    <p className="text-gray-800 leading-relaxed">{reply.comment}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
