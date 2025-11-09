"use client"

import type React from "react"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { createBooking } from "@/lib/api/booking-api"
import { fetchKosDetail } from "@/lib/api/kos-api"

export default function BookingPage({ params }: { params: Promise<{ roomId: string }> }) {
  // Unwrap params Promise for Next.js 15+
  const { roomId } = use(params)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
  })
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [kosData, setKosData] = useState<any>(null)
  const [isLoadingKos, setIsLoadingKos] = useState(true)

  // Fetch kos detail
  useEffect(() => {
    const loadKosDetail = async () => {
      try {
        setIsLoadingKos(true)
        const data = await fetchKosDetail(Number.parseInt(roomId))
        setKosData(data)
      } catch (error) {
        console.error('Error loading kos detail:', error)
        alert('Gagal memuat detail kos')
      } finally {
        setIsLoadingKos(false)
      }
    }

    if (roomId) {
      loadKosDetail()
    }
  }, [roomId])

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      console.log('Booking success:', data)
      setBookingConfirmed(true)
      // Try to get booking ID from response
      if (data?.data?.id) {
        setBookingId(data.data.id)
      }
    },
    onError: (error: Error) => {
      console.error('Booking error:', error)
      alert(error.message || 'Gagal membuat pemesanan')
    }
  })

  if (isLoadingKos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail kos...</p>
        </div>
      </div>
    )
  }

  if (!kosData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Kos tidak ditemukan</p>
          <Link href="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate dates
    if (!formData.startDate || !formData.endDate) {
      alert('Mohon isi tanggal mulai dan selesai')
      return
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    if (endDate <= startDate) {
      alert('Tanggal selesai harus setelah tanggal mulai')
      return
    }

    // Create booking
    bookingMutation.mutate({
      kos_id: Number.parseInt(roomId),
      start_date: formData.startDate,
      end_date: formData.endDate,
    })
  }

  // Calculate duration in months
  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0
    
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffMonths = Math.ceil(diffDays / 30) // Approximate months
    
    return diffMonths
  }

  const duration = calculateDuration()
  const pricePerMonth = parseInt(kosData.price_per_month || 0)
  const total = pricePerMonth * duration

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 bg-white shadow-sm z-50">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Kos Hunter</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-600 mb-2">Pesanan Berhasil!</h2>
              <p className="text-gray-600 mb-6">
                Pesanan Anda telah diterima dan menunggu konfirmasi dari pemilik kos.
              </p>
              {bookingId ? (
                <Link href={`/nota/${bookingId}`}>
                  <Button className="w-full md:w-auto">Lihat Nota Pemesanan</Button>
                </Link>
              ) : (
                <Link href="/profile">
                  <Button className="w-full md:w-auto">Lihat Riwayat Booking</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-blue-600">Kos Hunter</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pesan Kamar Kos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="font-semibold text-lg mb-2">{kosData.name}</p>
              <p className="text-gray-600">{kosData.address}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                Rp {parseInt(kosData.price_per_month || 0).toLocaleString("id-ID")}/bulan
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="bg-gray-100 p-4 rounded-lg my-6">
                <div className="flex justify-between mb-2">
                  <span>Harga per bulan:</span>
                  <span className="font-semibold">Rp {pricePerMonth.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Durasi:</span>
                  <span className="font-semibold">{duration} bulan</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold text-blue-600">
                  <span>Total:</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={bookingMutation.status === 'pending' || !formData.startDate || !formData.endDate}
              >
                {bookingMutation.status === 'pending' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Konfirmasi Pemesanan'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
