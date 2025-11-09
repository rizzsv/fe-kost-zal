"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Printer } from "lucide-react"
import { getBookingNota, BookingData } from "@/lib/api/booking-api"
import { getUserRole } from "@/lib/auth"

export default function NotaPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise for Next.js 15+
  const { id } = use(params)
  const router = useRouter()
  
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check role
    const role = getUserRole()
    if (role !== 'society') {
      router.push('/auth/login')
      return
    }

    fetchNota()
  }, [id, router])

  const fetchNota = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🧾 Fetching nota for booking ID:', id)
      
      const data = await getBookingNota(Number(id))
      console.log('📦 Nota data received:', data)
      setBooking(data)
    } catch (err) {
      console.error('❌ Error fetching nota:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch nota')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading nota...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Nota tidak ditemukan'}</p>
          <Link href="/dashboard">
            <Button>Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Kos Hunter</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8 pb-8 border-b">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Kos Hunter</h1>
              <p className="text-gray-600">BUKTI PEMESANAN KAMAR KOS</p>
            </div>

            {/* Booking Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm text-gray-600">No. Pemesanan</p>
                <p className="font-bold text-lg">KH-{String(booking.id_booking).padStart(4, "0")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal Pemesanan</p>
                <p className="font-bold text-lg">
                  {new Date(booking.created_at || '').toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>

            {/* Detail Kos */}
            <div className="mb-8 pb-8 border-b">
              <h3 className="font-bold text-lg mb-3">Detail Kos</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Nama Kos:</span> {booking.name}
                </p>
                <p>
                  <span className="font-medium">Alamat:</span> {booking.address}
                </p>
                <p>
                  <span className="font-medium">Tipe:</span> {booking.gender === 'male' ? 'Putra' : booking.gender === 'female' ? 'Putri' : 'Campur'}
                </p>
              </div>
            </div>

            {/* Durasi */}
            <div className="mb-8 pb-8 border-b">
              <h3 className="font-bold text-lg mb-3">Durasi Sewa</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Tanggal Mulai:</span>{" "}
                  {new Date(booking.start_date).toLocaleDateString("id-ID")}
                </p>
                <p>
                  <span className="font-medium">Tanggal Selesai:</span>{" "}
                  {new Date(booking.end_date).toLocaleDateString("id-ID")}
                </p>
                <p>
                  <span className="font-medium">Durasi:</span>{" "}
                  {Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} bulan
                </p>
                <p>
                  <span className="font-medium">Harga per Bulan:</span>{" "}
                  Rp {(typeof booking.price_per_month === 'string' 
                    ? parseInt(booking.price_per_month) 
                    : booking.price_per_month || 0
                  ).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total Pembayaran:</span>
                <span className="text-blue-600">
                  Rp {(
                    (typeof booking.price_per_month === 'string' 
                      ? parseInt(booking.price_per_month) 
                      : booking.price_per_month || 0
                    ) * Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
                  ).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="text-center pb-8 border-b">
              <p className="text-sm text-gray-600 mb-1">Status Pemesanan</p>
              <div
                className="inline-block px-4 py-2 rounded-lg font-semibold"
                style={{
                  backgroundColor:
                    booking.status === "accept" ? "#d1fae5" : booking.status === "reject" ? "#fee2e2" : "#fef3c7",
                  color:
                    booking.status === "accept" ? "#065f46" : booking.status === "reject" ? "#991b1b" : "#92400e",
                }}
              >
                {booking.status === "accept"
                  ? "Diterima"
                  : booking.status === "reject"
                    ? "Ditolak"
                    : "Menunggu Konfirmasi"}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-8 text-sm text-gray-600">
              <p>Terima kasih telah menggunakan Kos Hunter</p>
              <p className="mt-2">Hubungi pemilik kos untuk informasi lebih lanjut</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
