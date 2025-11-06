"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Printer } from "lucide-react"
import { DUMMY_BOOKINGS, DUMMY_KOS } from "@/lib/dummy-data"

export default function NotaPage({ params }: { params: { id: string } }) {
  const booking = DUMMY_BOOKINGS.find((b) => b.id === Number.parseInt(params.id))
  const kos = DUMMY_KOS.find((k) => k.id === booking?.kosId)
  const room = kos?.rooms.find((r) => r.id === booking?.roomId)

  if (!booking || !kos || !room) {
    return <div className="text-center py-12">Nota tidak ditemukan</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
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
                <p className="font-bold text-lg">KH-{String(booking.id).padStart(4, "0")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal Pemesanan</p>
                <p className="font-bold text-lg">{new Date(booking.date).toLocaleDateString("id-ID")}</p>
              </div>
            </div>

            {/* Detail Kos */}
            <div className="mb-8 pb-8 border-b">
              <h3 className="font-bold text-lg mb-3">Detail Kos</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Nama Kos:</span> {kos.name}
                </p>
                <p>
                  <span className="font-medium">Alamat:</span> {kos.location}
                </p>
                <p>
                  <span className="font-medium">Kamar:</span> {room.name} ({room.type})
                </p>
              </div>
            </div>

            {/* Durasi */}
            <div className="mb-8 pb-8 border-b">
              <h3 className="font-bold text-lg mb-3">Durasi Sewa</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Check-in:</span> {new Date(booking.checkIn).toLocaleDateString("id-ID")}
                </p>
                <p>
                  <span className="font-medium">Durasi:</span> {booking.duration} bulan
                </p>
                <p>
                  <span className="font-medium">Harga per Bulan:</span> Rp {room.price.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total Pembayaran:</span>
                <span className="text-blue-600">Rp {booking.total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Status */}
            <div className="text-center pb-8 border-b">
              <p className="text-sm text-gray-600 mb-1">Status Pemesanan</p>
              <div
                className="inline-block px-4 py-2 rounded-lg font-semibold"
                style={{
                  backgroundColor:
                    booking.status === "accepted" ? "#d1fae5" : booking.status === "rejected" ? "#fee2e2" : "#fef3c7",
                  color:
                    booking.status === "accepted" ? "#065f46" : booking.status === "rejected" ? "#991b1b" : "#92400e",
                }}
              >
                {booking.status === "accepted"
                  ? "Diterima"
                  : booking.status === "rejected"
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
