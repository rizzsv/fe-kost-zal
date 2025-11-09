'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getOwnerBookings, BookingData, updateBookingStatusByOwner } from '@/lib/api/booking-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { getUserRole } from '@/lib/auth'

export default function OwnerBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingBookingId, setUpdatingBookingId] = useState<number | null>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accept' | 'reject'>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [kosFilter, setKosFilter] = useState<'all' | number>('all')

  // Get unique kos list from bookings
  const kosList = useMemo(() => {
    const uniqueKos = Array.from(
      new Map(
        bookings.map(b => [b.kos_id, { id: b.kos_id, name: b.name, address: b.address }])
      ).values()
    )
    return uniqueKos
  }, [bookings])

  // Filter bookings based on selected kos
  const filteredBookings = useMemo(() => {
    if (kosFilter === 'all') {
      return bookings
    }
    return bookings.filter(b => b.kos_id === kosFilter)
  }, [bookings, kosFilter])

  useEffect(() => {
    // Check role
    const role = getUserRole()
    if (role !== 'owner') {
      router.push('/owner/login')
      return
    }

    fetchBookings()
  }, [statusFilter, dateFilter, router])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const status = statusFilter === 'all' ? undefined : statusFilter
      const date = dateFilter || undefined
      
      const data = await getOwnerBookings(status, date)
      setBookings(data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>
      case 'accept':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Accepted</Badge>
      case 'reject':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseInt(amount) : amount
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numAmount)
  }

  const handleUpdateStatus = async (bookingId: number, status: 'accept' | 'reject', kosName: string) => {
    const statusText = status === 'accept' ? 'terima' : 'tolak'
    if (!window.confirm(`Yakin ingin ${statusText} pemesanan untuk kos "${kosName}"?`)) {
      return
    }

    try {
      setUpdatingBookingId(bookingId)
      await updateBookingStatusByOwner(bookingId, status)
      
      const successText = status === 'accept' ? 'diterima' : 'ditolak'
      alert(`✅ Pemesanan berhasil ${successText}!`)
      
      // Refresh bookings list
      await fetchBookings()
    } catch (err) {
      console.error('Error updating booking status:', err)
      alert(err instanceof Error ? err.message : 'Gagal mengubah status pemesanan')
    } finally {
      setUpdatingBookingId(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pemesanan Kost</h1>
        <p className="text-gray-600 mt-2">Kelola pemesanan dari society</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Pemesanan</CardTitle>
          <CardDescription>Filter berdasarkan kos, status, dan tanggal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kos Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kos
              </label>
              <select
                value={kosFilter}
                onChange={(e) => setKosFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Semua Kos ({bookings.length})</option>
                {kosList.map((kos) => (
                  <option key={kos.id} value={kos.id}>
                    {kos.name} ({bookings.filter(b => b.kos_id === kos.id).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  Semua
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'accept' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('accept')}
                >
                  Accepted
                </Button>
                <Button
                  variant={statusFilter === 'reject' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('reject')}
                >
                  Rejected
                </Button>
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal
              </label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Pilih tanggal"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Tidak ada pemesanan</p>
                <p className="text-gray-400 text-sm mt-2">
                  {statusFilter !== 'all' || dateFilter || kosFilter !== 'all'
                    ? 'Coba ubah filter untuk melihat lebih banyak pemesanan'
                    : 'Belum ada society yang melakukan pemesanan'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id_booking} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{booking.name}</h3>
                        <p className="text-gray-600 text-sm">{booking.address}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500">ID Booking</p>
                        <p className="font-medium">#{booking.id_booking}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID User</p>
                        <p className="font-medium">#{booking.user_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Mulai</p>
                        <p className="font-medium">{formatDate(booking.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Selesai</p>
                        <p className="font-medium">{formatDate(booking.end_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Harga per Bulan</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(booking.price_per_month || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium capitalize">{booking.gender}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-400">
                        Dibuat: {formatDate(booking.created_at || '')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:w-40">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/owner/bookings/${booking.id_booking}`)}
                    >
                      Lihat Detail
                    </Button>
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdateStatus(booking.id_booking, 'accept', booking.name || 'kos ini')}
                          disabled={updatingBookingId === booking.id_booking}
                        >
                          {updatingBookingId === booking.id_booking ? 'Loading...' : 'Terima'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUpdateStatus(booking.id_booking, 'reject', booking.name || 'kos ini')}
                          disabled={updatingBookingId === booking.id_booking}
                        >
                          {updatingBookingId === booking.id_booking ? 'Loading...' : 'Tolak'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {bookings.length > 0 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total: <span className="font-semibold">{filteredBookings.length}</span> pemesanan
                  {kosFilter !== 'all' && <span className="text-xs ml-1">(dari {bookings.length} total)</span>}
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    Pending: <span className="font-semibold text-yellow-600">
                      {filteredBookings.filter(b => b.status === 'pending').length}
                    </span>
                  </div>
                  <div>
                    Accepted: <span className="font-semibold text-green-600">
                      {filteredBookings.filter(b => b.status === 'accept').length}
                    </span>
                  </div>
                  <div>
                    Rejected: <span className="font-semibold text-red-600">
                      {filteredBookings.filter(b => b.status === 'reject').length}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Kos breakdown */}
              {kosFilter === 'all' && kosList.length > 1 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Breakdown per Kos:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {kosList.map((kos) => {
                      const kosBookings = bookings.filter(b => b.kos_id === kos.id)
                      return (
                        <div key={kos.id} className="text-sm text-gray-600 flex justify-between">
                          <span>{kos.name}</span>
                          <span className="font-semibold">{kosBookings.length} pemesanan</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
