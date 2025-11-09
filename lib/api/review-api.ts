import env from '@/lib/env'
import { getAuthToken, getMakerId } from '@/lib/auth'

// API Configuration
const API_BASE_URL = env.apiBaseUrl

// Types
export interface ReviewData {
  id: number
  kos_id: number
  user_id: number
  rating?: number  // Optional, might not be in API response
  comment: string
  user_name?: string
  created_at: string
  updated_at?: string
  replies?: ReviewData[]  // Nested replies from owner
}

export interface ReviewListResponse {
  status?: boolean | "success" | "error"
  success?: boolean
  message?: string
  data: {
    id: number
    user_id: number
    name: string
    address: string
    price_per_month: string
    gender: string
    created_at: string
    updated_at: string
    reviews: ReviewData[]
  }
}

export interface ReviewCreateResponse {
  status?: boolean | "success" | "error"
  success?: boolean
  data: ReviewData
  message?: string
}

// Fetch reviews for a kos
export const getReviews = async (kosId: string): Promise<ReviewData[]> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  const headers: HeadersInit = {
    'MakerID': makerId,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  console.log('🔍 Fetching reviews for kos:', kosId)
  console.log('📤 Request URL:', `${API_BASE_URL}/society/show_reviews/${kosId}`)

  const response = await fetch(`${API_BASE_URL}/society/show_reviews/${kosId}`, {
    method: 'GET',
    headers,
  })

  console.log('📥 Reviews response status:', response.status)

  if (!response.ok) {
    // If 404, might not have reviews yet - return empty array
    if (response.status === 404) {
      console.log('⚠️ No reviews found (404), returning empty array')
      return []
    }
    const errorText = await response.text()
    console.error('❌ Failed to fetch reviews:', errorText)
    throw new Error(`Failed to fetch reviews: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('✅ Reviews data:', data)
  console.log('📊 Data structure:', {
    hasStatus: 'status' in data,
    statusValue: data.status,
    hasData: 'data' in data,
    hasReviews: data.data && 'reviews' in data.data,
  })
  
  // Handle different response formats
  // Format 1: { status: true, data: { reviews: [...] } } - Actual API format
  if ((data.status === true || data.status === "success") && data.data && Array.isArray(data.data.reviews)) {
    console.log('✅ Using Format 1: { status: true, data: { reviews: [...] } }')
    console.log('✅ Found', data.data.reviews.length, 'reviews')
    return data.data.reviews
  }
  
  // Format 2: { status: "success", data: [...] }
  if (data.status === "success" && Array.isArray(data.data)) {
    console.log('✅ Using Format 2: { status: "success", data: [...] }')
    console.log('✅ Found', data.data.length, 'reviews')
    return data.data
  }
  
  // Format 3: { success: true, data: [...] }
  if (data.success === true && Array.isArray(data.data)) {
    console.log('✅ Using Format 3: { success: true, data: [...] }')
    console.log('✅ Found', data.data.length, 'reviews')
    return data.data
  }
  
  // Format 4: { data: [...] }
  if (Array.isArray(data.data)) {
    console.log('✅ Using Format 4: { data: [...] }')
    console.log('✅ Found', data.data.length, 'reviews')
    return data.data
  }
  
  // Format 5: Direct array [...]
  if (Array.isArray(data)) {
    console.log('✅ Using Format 5: Direct array')
    console.log('✅ Found', data.length, 'reviews')
    return data
  }
  
  console.log('⚠️ No reviews in response, returning empty array')
  return []
}

// Create a review
export const createReview = async (
  kosId: string, 
  rating: number, 
  comment: string
): Promise<ReviewData> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('You must be logged in to create a review')
  }

  console.log('📝 Creating review for kos:', kosId)
  console.log('📤 Request URL:', `${API_BASE_URL}/society/store_reviews/${kosId}`)
  console.log('📤 Request body:', { review: comment })

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'MakerID': makerId,
    'Authorization': `Bearer ${token}`,
  }

  const response = await fetch(`${API_BASE_URL}/society/store_reviews/${kosId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      review: comment,  // API expects "review" not "comment"
    }),
  })

  console.log('📥 Create review response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Failed to create review:', errorText)
    throw new Error(`Failed to create review: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('✅ Create review response:', data)
  
  // Handle different response formats
  if ((data.status === true || data.status === "success") && data.data) {
    console.log('✅ Review created successfully')
    return data.data
  }
  
  if (data.success === true && data.data) {
    console.log('✅ Review created successfully')
    return data.data
  }
  
  if (data.data) {
    console.log('✅ Review created successfully')
    return data.data
  }
  
  if (data.id) {
    console.log('✅ Review created successfully')
    return data
  }
  
  console.error('❌ Unknown response format:', data)
  throw new Error(data.message || 'Failed to create review')
}

// Delete a review
export const deleteReview = async (reviewId: number): Promise<void> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('You must be logged in to delete a review')
  }

  console.log('🗑️ Deleting review:', reviewId)
  console.log('📤 Request URL:', `${API_BASE_URL}/society/delete_review/${reviewId}`)

  const headers: HeadersInit = {
    'MakerID': makerId,
    'Authorization': `Bearer ${token}`,
  }

  const response = await fetch(`${API_BASE_URL}/society/delete_review/${reviewId}`, {
    method: 'DELETE',
    headers,
  })

  console.log('📥 Delete review response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Failed to delete review:', errorText)
    throw new Error(`Failed to delete review: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('✅ Delete review response:', data)
  
  // Success if status is true or message indicates success
  if (data.status === true || data.status === "success" || data.success === true) {
    console.log('✅ Review deleted successfully')
    return
  }
  
  throw new Error(data.message || 'Failed to delete review')
}

// Get reviews for owner (admin endpoint)
export const getOwnerReviews = async (kosId: number): Promise<ReviewData[]> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('You must be logged in as owner to view reviews')
  }

  const headers: HeadersInit = {
    'MakerID': makerId,
    'Authorization': `Bearer ${token}`,
  }

  console.log('🔍 Fetching owner reviews for kos:', kosId)
  console.log('📤 Request URL:', `${API_BASE_URL}/admin/show_reviews/${kosId}`)

  const response = await fetch(`${API_BASE_URL}/admin/show_reviews/${kosId}`, {
    method: 'GET',
    headers,
  })

  console.log('📥 Owner reviews response status:', response.status)

  if (!response.ok) {
    // If 404, might not have reviews yet - return empty array
    if (response.status === 404) {
      console.log('⚠️ No reviews found (404), returning empty array')
      return []
    }
    const errorText = await response.text()
    console.error('❌ Failed to fetch owner reviews:', errorText)
    throw new Error(`Failed to fetch reviews: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('✅ Owner reviews data:', data)
  console.log('📊 Data structure:', {
    hasStatus: 'status' in data,
    statusValue: data.status,
    hasData: 'data' in data,
    hasReviews: data.data && 'reviews' in data.data,
  })
  
  // Handle different response formats
  // Format 1: { status: true, data: { reviews: [...] } } - Actual API format
  if ((data.status === true || data.status === "success") && data.data && Array.isArray(data.data.reviews)) {
    console.log('✅ Using Format 1: { status: true, data: { reviews: [...] } }')
    console.log('✅ Found', data.data.reviews.length, 'reviews')
    return data.data.reviews
  }
  
  // Format 2: { status: "success", data: [...] }
  if (data.status === "success" && Array.isArray(data.data)) {
    console.log('✅ Using Format 2: { status: "success", data: [...] }')
    console.log('✅ Found', data.data.length, 'reviews')
    return data.data
  }
  
  // Format 3: { success: true, data: [...] }
  if (data.success === true && Array.isArray(data.data)) {
    console.log('✅ Using Format 3: { success: true, data: [...] }')
    console.log('✅ Found', data.data.length, 'reviews')
    return data.data
  }
  
  // Format 4: { data: [...] }
  if (Array.isArray(data.data)) {
    console.log('✅ Using Format 4: { data: [...] }')
    console.log('✅ Found', data.data.length, 'reviews')
    return data.data
  }
  
  // Format 5: Direct array [...]
  if (Array.isArray(data)) {
    console.log('✅ Using Format 5: Direct array')
    console.log('✅ Found', data.length, 'reviews')
    return data
  }
  
  console.log('⚠️ No reviews in response, returning empty array')
  return []
}
// Owner reply function
export const addOwnerReply = async (
  kosId: number, 
  replyText: string
): Promise<any> => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken")
  const makerId = "1"

  if (!token) {
    throw new Error("You must be logged in as owner to reply to reviews")
  }

  const response = await fetch(`https://learn.smktelkom-mlg.sch.id/kos/api/admin/store_reviews/${kosId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "MakerID": makerId,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      review: replyText,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to add reply: ${response.statusText}`)
  }

  const text = await response.text()
  if (text) {
    try {
      return JSON.parse(text)
    } catch (e) {
      return { success: true }
    }
  }
  
  return { success: true }
}
