import env from '@/lib/env'
import { getAuthToken, getMakerId } from '@/lib/auth'

// API Configuration
const API_BASE_URL = env.apiBaseUrl

// Types
export interface BookingData {
  id_booking: number
  id?: number
  user_id: number
  kos_id: number
  start_date: string
  end_date: string
  status: 'pending' | 'accept' | 'reject'
  total_price?: number
  created_at?: string
  updated_at?: string
  // Kos data embedded in response
  name?: string
  address?: string
  price_per_month?: string | number
  gender?: string
  // Relations (alternative format)
  kos?: {
    id: number
    name: string
    address: string
    price_per_month: string | number
    image?: string
  }
  user?: {
    id: number
    name: string
    email?: string
  }
}

export interface CreateBookingRequest {
  kos_id: number
  start_date: string
  end_date: string
}

export interface BookingResponse {
  status?: "success" | "error"
  success?: boolean
  data?: BookingData | BookingData[]
  message?: string
}

/**
 * Create a new booking
 * POST /society/booking
 */
export const createBooking = async (bookingData: CreateBookingRequest): Promise<any> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('No authentication token found. Please login first.')
  }

  console.log('📝 Creating booking:', bookingData)

  const response = await fetch(`${API_BASE_URL}/society/booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'MakerID': makerId,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  })

  console.log('📥 Booking response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Booking error:', errorText)
    
    try {
      const errorData = JSON.parse(errorText)
      throw new Error(errorData.message || 'Failed to create booking')
    } catch {
      throw new Error(errorText || 'Failed to create booking')
    }
  }

  // Handle empty response body
  const text = await response.text()
  console.log('📥 Booking response text:', text)

  if (!text || text.trim() === '') {
    console.log('✅ Booking created successfully (empty response)')
    return { success: true, message: 'Booking berhasil dibuat' }
  }

  try {
    const data = JSON.parse(text)
    console.log('✅ Booking created:', data)
    
    // Handle different response formats
    if (data.status === "success" || data.success === true) {
      return data
    }
    
    return data
  } catch (e) {
    console.log('✅ Booking created successfully (invalid JSON)')
    return { success: true, message: 'Booking berhasil dibuat' }
  }
}

/**
 * Get booking history with optional status filter
 * GET /society/show_bookings?status=pending
 */
export const getBookingHistory = async (status?: 'pending' | 'accept' | 'reject'): Promise<BookingData[]> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('No authentication token found. Please login first.')
  }

  const url = new URL(`${API_BASE_URL}/society/show_bookings`)
  if (status) {
    url.searchParams.append('status', status)
  }

  console.log('🔍 Fetching booking history:', { status, url: url.toString() })

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'MakerID': makerId,
      'Authorization': `Bearer ${token}`,
    },
  })

  console.log('📥 Booking history response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Booking history error:', errorText)
    
    // If 404, return empty array (no bookings yet)
    if (response.status === 404) {
      console.log('⚠️ No bookings found')
      return []
    }
    
    throw new Error(`Failed to fetch booking history: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('📦 Booking history data:', data)

  // Handle different response formats
  if (data.status === "success" && Array.isArray(data.data)) {
    console.log('✅ Using Format 1: { status: "success", data: [...] }')
    return data.data
  }

  if (data.success === true && Array.isArray(data.data)) {
    console.log('✅ Using Format 2: { success: true, data: [...] }')
    return data.data
  }

  if (Array.isArray(data.data)) {
    console.log('✅ Using Format 3: { data: [...] }')
    return data.data
  }

  if (Array.isArray(data)) {
    console.log('✅ Using Format 4: Direct array')
    return data
  }

  // Success but no data
  if (data.success === true || data.status === "success") {
    console.log('⚠️ Success but no data array, returning empty')
    return []
  }

  console.error('❌ Unknown response format:', data)
  throw new Error(data.message || 'Invalid response format from API')
}

/**
 * Get nota (receipt) for a booking
 * GET /society/cetak_nota/{id}
 */
export const getBookingNota = async (bookingId: number): Promise<BookingData> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('No authentication token found. Please login first.')
  }

  console.log('🧾 Fetching nota for booking:', bookingId)

  const response = await fetch(`${API_BASE_URL}/society/cetak_nota/${bookingId}`, {
    method: 'GET',
    headers: {
      'MakerID': makerId,
      'Authorization': `Bearer ${token}`,
    },
  })

  console.log('📥 Nota response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Nota error:', errorText)
    throw new Error(`Failed to fetch nota: ${response.statusText}`)
  }

  const text = await response.text()
  console.log('📥 Nota response text:', text)

  if (!text || text.trim() === '') {
    throw new Error('Empty response from server')
  }

  const data = JSON.parse(text)
  console.log('✅ Nota data:', data)
  
  // Handle different response formats
  if (data.status === "success" && data.data) {
    return data.data
  }

  if (data.success === true && data.data) {
    return data.data
  }

  if (data.data && typeof data.data === 'object') {
    return data.data
  }

  if (data.id_booking) {
    return data
  }

  throw new Error(data.message || 'Invalid response format from API')
}

/**
 * Update booking status (accept/reject)
 * Note: This might be used by admin, but keeping it here for reference
 */
export const updateBookingStatus = async (
  bookingId: number, 
  status: 'accept' | 'reject'
): Promise<any> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('No authentication token found. Please login first.')
  }

  console.log('📝 Updating booking status:', { bookingId, status })

  const response = await fetch(`${API_BASE_URL}/society/cetak_nota/${bookingId}`, {
    method: 'GET', // API uses GET with body (unusual)
    headers: {
      'Content-Type': 'application/json',
      'MakerID': makerId,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })

  console.log('📥 Update status response:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Update status error:', errorText)
    throw new Error(`Failed to update booking status: ${response.statusText}`)
  }

  const text = await response.text()
  
  if (!text || text.trim() === '') {
    return { success: true }
  }

  try {
    return JSON.parse(text)
  } catch {
    return { success: true }
  }
}

/**
 * OWNER API Functions
 */

/**
 * Update booking status (accept/reject) - OWNER ONLY
 * PUT /admin/update_status_booking/{id}
 */
export const updateBookingStatusByOwner = async (
  bookingId: number, 
  status: 'accept' | 'reject'
): Promise<any> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('No authentication token found. Please login first.')
  }

  console.log('📝 Owner updating booking status:', { bookingId, status })

  const response = await fetch(`${API_BASE_URL}/admin/update_status_booking/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'MakerID': makerId,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })

  console.log('📥 Update status response:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Update status error:', errorText)
    
    try {
      const errorData = JSON.parse(errorText)
      throw new Error(errorData.message || 'Failed to update booking status')
    } catch {
      throw new Error(errorText || 'Failed to update booking status')
    }
  }

  const text = await response.text()
  console.log('📥 Update status response text:', text)
  
  if (!text || text.trim() === '') {
    console.log('✅ Booking status updated successfully (empty response)')
    return { success: true, message: 'Status berhasil diperbarui' }
  }

  try {
    const data = JSON.parse(text)
    console.log('✅ Booking status updated:', data)
    return data
  } catch {
    console.log('✅ Booking status updated successfully (invalid JSON)')
    return { success: true, message: 'Status berhasil diperbarui' }
  }
}

/**
 * Get bookings for owner (admin endpoint)
 * GET /admin/show_bookings?status=&tgl=2025-08-31
 */
export const getOwnerBookings = async (
  status?: 'pending' | 'accept' | 'reject',
  date?: string // Format: YYYY-MM-DD
): Promise<BookingData[]> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('No authentication token found. Please login first.')
  }

  const url = new URL(`${API_BASE_URL}/admin/show_bookings`)
  
  // Add query parameters
  if (status) {
    url.searchParams.append('status', status)
  } else {
    url.searchParams.append('status', '') // Empty status to get all
  }
  
  if (date) {
    url.searchParams.append('tgl', date)
  }

  console.log('🔍 Fetching owner bookings:', { 
    status, 
    date, 
    url: url.toString() 
  })

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'MakerID': makerId,
      'Authorization': `Bearer ${token}`,
    },
  })

  console.log('📥 Owner bookings response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Owner bookings error:', errorText)
    
    // If 404, return empty array (no bookings yet)
    if (response.status === 404) {
      console.log('⚠️ No bookings found')
      return []
    }
    
    throw new Error(`Failed to fetch owner bookings: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('📦 Owner bookings data:', data)
  console.log('📊 Number of bookings received:', Array.isArray(data.data) ? data.data.length : 'not array')
  
  // Log unique kos_ids to see how many different kos have bookings
  if (Array.isArray(data.data)) {
    const uniqueKosIds = [...new Set(data.data.map((b: any) => b.kos_id))]
    console.log('🏠 Unique kos with bookings:', uniqueKosIds)
    console.log('🏠 Number of different kos:', uniqueKosIds.length)
  }

  // Handle different response formats
  if (data.status === "success" && Array.isArray(data.data)) {
    console.log('✅ Using Format 1: { status: "success", data: [...] }')
    return data.data
  }

  if (data.success === true && Array.isArray(data.data)) {
    console.log('✅ Using Format 2: { success: true, data: [...] }')
    return data.data
  }

  if (Array.isArray(data.data)) {
    console.log('✅ Using Format 3: { data: [...] }')
    return data.data
  }

  if (Array.isArray(data)) {
    console.log('✅ Using Format 4: Direct array')
    return data
  }

  // Success but no data
  if (data.success === true || data.status === "success") {
    console.log('⚠️ Success but no data array, returning empty')
    return []
  }

  console.error('❌ Unknown response format:', data)
  throw new Error(data.message || 'Invalid response format from API')
}
