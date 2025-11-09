"use client"

import { use, useState, useEffect, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Star, MapPin, ArrowLeft, Send, Wifi, Car, Utensils, Wind, Tv, Waves, Trash2, Calendar } from "lucide-react"
import { fetchKosDetail, getKosImageUrl } from "@/lib/api/kos-api"
import { getReviews, createReview, deleteReview } from "@/lib/api/review-api"
import Image from "next/image"
import { useRouter } from "next/navigation"

// Icon mapping for facilities
const facilityIcons: { [key: string]: any } = {
  'wifi': Wifi,
  'parkir': Car,
  'dapur': Utensils,
  'ac': Wind,
  'tv': Tv,
  'kamar mandi': Waves,
}

export default function KosDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise for Next.js 15+
  const { id } = use(params)
  const router = useRouter()
  
  const [newComment, setNewComment] = useState("")
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  // Get current user ID from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setCurrentUserId(user.id)
      } catch (err) {
        console.error("Failed to parse user data")
      }
    }
  }, [])

  // Fetch kost detail
  const { data: kos, isLoading: kosLoading, error: kosError } = useQuery({
    queryKey: ['kos', id],
    queryFn: () => fetchKosDetail(Number(id)),
  })

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getReviews(id),
  })

  // Group reviews: Nest owner replies under society reviews
  const groupedReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return []

    console.log('🔍 All reviews:', reviews)
    console.log('📍 Kos data:', kos)
    console.log('👤 Kos owner user_id:', kos?.user_id)

    // Owner adalah yang punya kos ini (kos.user_id)
    const kosOwnerUserId = kos?.user_id

    // Separate society reviews and owner replies
    const societyReviews: Array<any & { replies: any[] }> = []
    const ownerReplies: any[] = []

    reviews.forEach((review: any) => {
      console.log('Review:', {
        id: review.id,
        user_id: review.user_id,
        comment: review.comment.substring(0, 20) + '...',
        created_at: review.created_at
      })

      // Owner reply adalah review yang user_id nya sama dengan pemilik kos
      const isOwnerReply = review.user_id === kosOwnerUserId

      if (isOwnerReply) {
        console.log('✅ OWNER REPLY detected! (user_id:', review.user_id, '=== kos owner:', kosOwnerUserId, ')')
        ownerReplies.push(review)
      } else {
        console.log('✅ SOCIETY REVIEW (user_id:', review.user_id, '!== kos owner:', kosOwnerUserId, ')')
        societyReviews.push({
          ...review,
          replies: [] // Initialize empty replies array
        })
      }
    })

    console.log('📊 Society Reviews:', societyReviews.length)
    console.log('📊 Owner Replies:', ownerReplies.length)

    // Match owner replies with society reviews (by timestamp proximity)
    ownerReplies.forEach((reply) => {
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
      
      // Add as nested reply if match found
      if (closestReview) {
        console.log(`💬 Matching reply ${reply.id} with review ${closestReview.id}`)
        closestReview.replies.push(reply)
      } else {
        console.log(`⚠️ No match found for reply ${reply.id} - adding as standalone`)
        // If no match, still keep it (maybe it's a general owner comment)
      }
    })

    console.log('📦 Final grouped reviews:', societyReviews)

    return societyReviews
  }, [reviews, kos])

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: (comment: string) => 
      createReview(id, 0, comment), // rating is not used by API, pass 0
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
      queryClient.invalidateQueries({ queryKey: ['kos', id] })
      setNewComment("")
    },
  })

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
      queryClient.invalidateQueries({ queryKey: ['kos', id] })
    },
  })

  const handleAddComment = () => {
    if (newComment.trim()) {
      createReviewMutation.mutate(newComment)
    }
  }

  const handleDeleteReview = (reviewId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) {
      deleteReviewMutation.mutate(reviewId)
    }
  }

  if (kosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data kos...</p>
        </div>
      </div>
    )
  }

  if (kosError || !kos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-2">Kos tidak ditemukan</p>
          <Link href="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get first image with proper URL construction
  let mainImage = "/placeholder.svg"
  
  if (kos.kos_image && kos.kos_image.length > 0) {
    mainImage = getKosImageUrl(kos.kos_image[0])
  } else if (kos.image) {
    mainImage = kos.image.startsWith('http') 
      ? kos.image 
      : `https://learn.smktelkom-mlg.sch.id/kos/storage/${kos.image}`
  }
  
  const facilities = kos.kos_facilities || []
  
  // Calculate average rating from reviews (if rating exists)
  // Note: API might not return rating field in reviews
  const reviewsWithRating = reviews.filter(r => r.rating !== undefined)
  const averageRating = reviewsWithRating.length > 0 
    ? (reviewsWithRating.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsWithRating.length).toFixed(1)
    : "N/A"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-blue-600">Kos Hunter</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Images */}
        <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden">
          <Image
            src={mainImage}
            alt={kos.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>

        {/* Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{kos.name}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-5 h-5 mr-2" />
                  {kos.address}
                </div>
              </div>
              <Badge className="text-lg px-3 py-1">
                {kos.gender === "male" ? "Putra" : kos.gender === "female" ? "Putri" : "Campur"}
              </Badge>
            </div>

            <div className="flex items-center mb-6">
              <Star className="w-5 h-5 text-yellow-500 mr-2 fill-yellow-500" />
              <span className="font-semibold text-lg">{averageRating}</span>
              <span className="text-gray-600 ml-2">({reviews.length} ulasan)</span>
            </div>

            <div className="mb-6">
              <p className="text-2xl font-bold text-blue-600">
                Rp {typeof kos.price_per_month === 'string' 
                  ? parseInt(kos.price_per_month).toLocaleString('id-ID') 
                  : kos.price_per_month.toLocaleString('id-ID')}/bulan
              </p>
            </div>

            {/* Booking Button */}
            <div className="mb-6">
              <Button 
                size="lg" 
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                onClick={() => router.push(`/booking/${id}`)}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Booking Sekarang
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                🔒 Booking aman dan terpercaya
              </p>
            </div>

            {/* Facilities */}
            {facilities.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Fasilitas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {facilities.map((fac) => {
                    const IconComponent = facilityIcons[fac.facility_name.toLowerCase()] || Wifi
                    return (
                      <div key={fac.id} className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{fac.facility_name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Gallery */}
            {kos.kos_image && kos.kos_image.length > 1 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Galeri Foto</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {kos.kos_image.slice(1).map((img) => (
                    <div key={img.id} className="relative h-40 rounded-lg overflow-hidden">
                      <Image
                        src={getKosImageUrl(img)}
                        alt={`${kos.name} - ${img.id}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 280px"
                        onError={(e) => {
                          console.error('❌ Gallery image failed:', getKosImageUrl(img))
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ulasan & Komentar</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment */}
            <div className="mb-6 pb-6 border-b">
              <label className="block text-sm font-medium mb-3">Tulis Ulasan Anda</label>
              <Textarea
                placeholder="Tulis komentar Anda..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
                rows={4}
              />
              <Button 
                onClick={handleAddComment} 
                className="w-full"
                disabled={createReviewMutation.isPending || !newComment.trim()}
              >
                {createReviewMutation.isPending ? (
                  <>Mengirim...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Komentar
                  </>
                )}
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {reviewsLoading ? (
                <p className="text-gray-600 text-center py-8">Memuat ulasan...</p>
              ) : groupedReviews.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Belum ada ulasan. Jadilah yang pertama!</p>
              ) : (
                groupedReviews.map((review) => (
                  <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    {/* Main Review */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {review.user_name ? review.user_name[0].toUpperCase() : "U"}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{review.user_name || `User #${review.user_id}`}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(review.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {review.rating !== undefined && review.rating > 0 && (
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating! ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        )}
                        {/* Show delete button only for the review owner */}
                        {currentUserId && review.user_id === currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deleteReviewMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 ml-13 mb-3">{review.comment}</p>

                    {/* Nested Owner Replies */}
                    {review.replies && review.replies.length > 0 && (
                      <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-3">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                          💬 Balasan dari Owner
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
