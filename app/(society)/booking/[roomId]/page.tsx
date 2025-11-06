"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { DUMMY_KOS } from "@/lib/dummy-data"

export default function BookingPage({ params }: { params: { roomId: string } }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: "",
    duration: 1,
  })
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  const room = DUMMY_KOS.flatMap((k) => k.rooms).find((r) => r.id === Number.parseInt(params.roomId))
  const kos = DUMMY_KOS.find((k) => k.rooms.some((r) => r.id === Number.parseInt(params.roomId)))

  if (!room || !kos) {
    return <div className="text-center py-12">Kamar tidak ditemukan</div>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBookingConfirmed(true)
  }

  const total = room.price * formData.duration

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
              <Link href="/nota/1">
                <Button className="w-full md:w-auto">Lihat Nota Pemesanan</Button>
              </Link>
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
              <p className="font-semibold text-lg mb-2">{kos.name}</p>
              <p className="text-gray-600">
                {room.name} - {room.type}
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-2">Rp {room.price.toLocaleString("id-ID")}/bulan</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <Input
                  type="text"
                  placeholder="Masukkan nama Anda"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">No. Telepon</label>
                <Input
                  type="tel"
                  placeholder="08xx-xxxx-xxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Check-in</label>
                <Input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Durasi (bulan)</label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="bg-gray-100 p-4 rounded-lg my-6">
                <div className="flex justify-between mb-2">
                  <span>Harga per bulan:</span>
                  <span className="font-semibold">Rp {room.price.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Durasi:</span>
                  <span className="font-semibold">{formData.duration} bulan</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold text-blue-600">
                  <span>Total:</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Konfirmasi Pemesanan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
