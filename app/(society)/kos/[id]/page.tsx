"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Star, MapPin, ArrowLeft, Send } from "lucide-react"
import { DUMMY_KOS, DUMMY_FACILITIES } from "@/lib/dummy-data"

export default function KosDetailPage({ params }: { params: { id: string } }) {
  const kos = DUMMY_KOS.find((k) => k.id === Number.parseInt(params.id))
  const [comments, setComments] = useState(kos?.comments || [])
  const [newComment, setNewComment] = useState("")
  const [newRating, setNewRating] = useState(5)

  if (!kos) {
    return <div className="text-center py-12">Kos tidak ditemukan</div>
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: comments.length + 1,
          author: "Anda",
          rating: newRating,
          text: newComment,
          date: "Baru saja",
        },
      ])
      setNewComment("")
      setNewRating(5)
    }
  }

  const facilities = DUMMY_FACILITIES.filter((f) => kos.facilities.includes(f.id))

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
        <img
          src={kos.image || "/placeholder.svg"}
          alt={kos.name}
          className="w-full h-96 object-cover rounded-xl mb-8"
        />

        {/* Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{kos.name}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-5 h-5 mr-2" />
                  {kos.location}
                </div>
              </div>
              <Badge className="text-lg px-3 py-1">
                {kos.gender === "male" ? "Putra" : kos.gender === "female" ? "Putri" : "Campur"}
              </Badge>
            </div>

            <div className="flex items-center mb-6">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="font-semibold text-lg">{kos.rating}</span>
              <span className="text-gray-600 ml-2">({kos.reviews} ulasan)</span>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">{kos.description}</p>
            </div>

            {/* Facilities */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Fasilitas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {facilities.map((fac) => (
                  <div key={fac.id} className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                    <span className="text-2xl">{fac.icon}</span>
                    <span className="font-medium">{fac.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Kamar Tersedia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {kos.rooms.map((room) => (
                  <div key={room.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{room.name}</p>
                        <p className="text-sm text-gray-600">{room.type}</p>
                      </div>
                      <Badge variant={room.available ? "default" : "secondary"}>
                        {room.available ? "Tersedia" : "Penuh"}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-blue-600 mb-3">Rp {room.price.toLocaleString("id-ID")}</p>
                    {room.available && (
                      <Link href={`/booking/${room.id}`}>
                        <Button className="w-full">Pesan Sekarang</Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className={`text-2xl ${star <= newRating ? "text-yellow-500" : "text-gray-300"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Tulis komentar Anda..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
              />
              <Button onClick={handleAddComment} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Kirim Komentar
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Belum ada ulasan. Jadilah yang pertama!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{comment.author}</p>
                        <p className="text-sm text-gray-600">{comment.date}</p>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < comment.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
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
