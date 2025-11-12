import env from '@/lib/env'
import { getAuthToken, getMakerId, getUserRole } from '@/lib/auth'

// API Configuration
const API_BASE_URL = env.apiBaseUrl

// Types
export interface KosImage {
  id: number
  kos_id: number
  file: string
  created_at?: string
  updated_at?: string
}

export interface KosFacility {
  id: number
  kos_id: number
  facility_name: string
  created_at?: string
  updated_at?: string
}

export interface KosData {
  id: number
  user_id: number | string
  name: string
  address: string
  // backend returns price as string in example, allow both
  price_per_month: string | number
  gender: "male" | "female" | "mix"
  created_at?: string
  updated_at?: string
  // arrays returned by society/detail_kos
  kos_image?: KosImage[]
  kos_facilities?: KosFacility[]
  // optional legacy fields
  image?: string
  rating?: number
  reviews?: number
  description?: string
}

export interface KosDetailResponse {
  status?: "success" | "error"
  success?: boolean
  data: KosData
  message?: string
}

export interface KosListResponse {
  status?: "success" | "error"
  success?: boolean
  data: KosData[]
  message?: string
}

// Fetch list of kos with optional search
export const fetchKosList = async (search?: string): Promise<KosData[]> => {
  const token = getAuthToken()
  const makerId = getMakerId()
  const userRole = getUserRole()

  // Different strategy based on role
  let authToken: string | null = token
  let endpoint = '/admin/show_kos'
  
  if (userRole === 'society') {
    // Society should browse ALL kos from all owners
    // Use society endpoint WITH token to access the API
    endpoint = '/society/show_kos'
    // Keep using society token to authenticate
    authToken = token
    console.log('📖 Society browsing ALL kos with society token')
  } else if (userRole === 'owner') {
    // Owner: use their own token (only see their own kos)
    if (!token) {
      throw new Error('No authentication token found. Please login first.')
    }
    endpoint = '/admin/show_kos'
    console.log('👔 Owner accessing their own kos with personal token')
  } else {
    // No role set - guest browsing, try society endpoint
    endpoint = '/society/show_kos'
    authToken = null
    console.log('👤 Guest browsing ALL kos')
  }

  const url = new URL(`${API_BASE_URL}${endpoint}`)
  
  if (search) {
    url.searchParams.append('search', search)
  }
  
  console.log('🔍 Fetching kos list:', { 
    role: userRole, 
    endpoint, 
    url: url.toString(),
    usingToken: !!authToken 
  })

  const headers: HeadersInit = {
    'MakerID': makerId,
  }

  // Add Authorization header only if token exists
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error Response:', errorText)
    
    // If society endpoint fails with 404, might not exist yet
    if (response.status === 404 && endpoint === '/society/show_kos') {
      console.warn('⚠️ Society endpoint not found')
      return [] // Return empty array
    }
    
    // If 401 and society, might need to login (but allow public browsing)
    if (response.status === 401 && userRole === 'society') {
      console.warn('⚠️ Unauthorized, but allowing public browsing')
      return [] // Return empty array for public browsing
    }
    
    throw new Error(`Failed to fetch kos list: ${response.statusText}`)
  }

  const data = await response.json()
  
  // Debug log
  console.log('API Response:', data)
  console.log('Response type:', typeof data)
  console.log('Has status field:', 'status' in data)
  console.log('Has success field:', 'success' in data)
  console.log('Has data field:', 'data' in data)
  console.log('data.data is array:', Array.isArray(data?.data))
  
  // Check for pagination info
  if (data.meta || data.pagination) {
    console.log('📄 Pagination info:', data.meta || data.pagination)
    console.log('⚠️ Warning: API uses pagination, but this function fetches only first page')
  }
  
  // Check total records info
  if (data.total) {
    console.log('📊 Total records available:', data.total)
  }
  
  // Handle different response formats
  // Format 1: { status: "success", data: [...] } - API actual format
  if (data.status === "success" && Array.isArray(data.data)) {
    console.log('✅ Using Format 1: { status: "success", data: [...] }')
    console.log('📦 Fetched', data.data.length, 'kos records')
    return data.data
  }
  
  // Format 2: { success: true, data: [...] }
  if (data.success === true && Array.isArray(data.data)) {
    console.log('✅ Using Format 2: { success: true, data: [...] }')
    console.log('📦 Fetched', data.data.length, 'kos records')
    return data.data
  }
  
  // Format 3: { data: [...] } (without success/status field)
  if (Array.isArray(data.data)) {
    console.log('✅ Using Format 3: { data: [...] }')
    console.log('📦 Fetched', data.data.length, 'kos records')
    return data.data
  }
  
  // Format 4: Direct array [...]
  if (Array.isArray(data)) {
    console.log('✅ Using Format 4: Direct array')
    console.log('📦 Fetched', data.length, 'kos records')
    return data
  }
  
  // Format 5: Success/Status but no data
  if (data.success === true || data.status === "success") {
    console.log('⚠️ Success but no data array, returning empty')
    return []
  }
  
  // If none of the above, throw error
  console.error('❌ Unknown response format:', data)
  throw new Error(data.message || 'Invalid response format from API')
}

// Fetch detail of a specific kos
export const fetchKosDetail = async (kosId: number): Promise<KosData> => {
  const token = getAuthToken()
  const makerId = getMakerId()
  const userRole = getUserRole()

  // Different strategy based on role
  let authToken = token
  let endpoint = `/admin/detail_kos/${kosId}`
  
  if (userRole === 'society') {
    // Society endpoint - sesuai dokumentasi API
    endpoint = `/society/detail_kos/${kosId}`
    console.log('📖 Society viewing detail with society token')
  } else if (userRole === 'owner') {
    // Owner: use their own token
    if (!token) {
      throw new Error('No authentication token found. Please login first.')
    }
    endpoint = `/admin/detail_kos/${kosId}`
    console.log('👔 Owner viewing detail with personal token')
  } else {
    // Guest
    endpoint = `/society/detail_kos/${kosId}`
    console.log('👤 Guest viewing detail')
  }
  
  const fullUrl = `${API_BASE_URL}${endpoint}`
  console.log('🔍 Fetching kos detail:', { 
    role: userRole, 
    kosId, 
    endpoint,
    fullUrl,
    hasToken: !!authToken,
    makerId
  })

  const headers: HeadersInit = {
    'MakerID': makerId,
  }

  // Add Authorization header only if token exists
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  console.log('📤 Request headers:', headers)

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers,
  })

  console.log('📥 Response status:', response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ API Error Response:', errorText)
    console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()))
    
    // If society endpoint fails with 404, try fallback
    if (response.status === 404 && endpoint.includes('/society/')) {
      console.warn('⚠️ Society endpoint not found, trying alternative endpoint...')
      // Fallback: try admin endpoint (might work for public view)
      const fallbackEndpoint = `/admin/detail_kos/${kosId}`
      const fallbackUrl = `${API_BASE_URL}${fallbackEndpoint}`
      console.log('🔄 Trying fallback URL:', fallbackUrl)
      
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'GET',
        headers,
      })
      
      console.log('📥 Fallback response status:', fallbackResponse.status)
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        console.log('✅ Fallback successful, data:', fallbackData)
        
        // Handle different response formats
        if (fallbackData.status === "success" && fallbackData.data) return fallbackData.data
        if (fallbackData.success === true && fallbackData.data) return fallbackData.data
        if (fallbackData.data && typeof fallbackData.data === 'object') return fallbackData.data
        if (fallbackData.id) return fallbackData
      } else {
        const fallbackError = await fallbackResponse.text()
        console.error('❌ Fallback also failed:', fallbackError)
      }
    }
    
    throw new Error(`Failed to fetch kos detail: ${response.statusText}`)
  }

  const data = await response.json()
  
  // Debug log
  console.log('✅ API Detail Response:', data)
  console.log('📊 Response type:', typeof data)
  console.log('📊 Has status field:', 'status' in data)
  console.log('📊 Has success field:', 'success' in data)
  console.log('📊 Has data field:', 'data' in data)
  console.log('📊 Has id field:', 'id' in data)
  
  // Handle different response formats
  // Format 1: { status: "success", data: {...} } - API actual format
  if (data.status === "success" && data.data) {
    console.log('✅ Using Format 1: { status: "success", data: {...} }')
    return data.data
  }
  
  // Format 2: { success: true, data: {...} }
  if (data.success === true && data.data) {
    console.log('✅ Using Format 2: { success: true, data: {...} }')
    return data.data
  }
  
  // Format 3: { data: {...} } (without success/status field)
  if (data.data && typeof data.data === 'object') {
    console.log('✅ Using Format 3: { data: {...} }')
    return data.data
  }
  
  // Format 4: Direct object {...}
  if (data.id) {
    console.log('✅ Using Format 4: Direct object')
    return data
  }
  
  // If none of the above, throw error
  console.error('❌ Unknown response format:', data)
  throw new Error(data.message || 'Invalid response format from API')
}

/**
 * Get images for a specific kos
 * GET /admin/show_image/{kosId}
 */
export const fetchKosImages = async (kosId: number): Promise<KosImage[]> => {
  const token = getAuthToken()
  const makerId = getMakerId()
  const userRole = getUserRole()

  // Determine endpoint based on role
  let endpoint = `/admin/show_image/${kosId}`
  
  if (userRole === 'society') {
    // Society might have different endpoint or same
    endpoint = `/society/show_image/${kosId}`
  }
  
  const fullUrl = `${API_BASE_URL}${endpoint}`
  console.log('🖼️ Fetching kos images:', { kosId, endpoint, fullUrl })

  const headers: HeadersInit = {
    'MakerID': makerId,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers,
  })

  console.log('📥 Images response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Images error:', errorText)
    
    // If 404, return empty array
    if (response.status === 404) {
      console.log('⚠️ No images found for this kos')
      return []
    }
    
    throw new Error(`Failed to fetch kos images: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('📦 Images data:', data)

  // Handle different response formats
  if (data.status === "success" && Array.isArray(data.data)) {
    console.log('✅ Found', data.data.length, 'images')
    return data.data
  }

  if (data.success === true && Array.isArray(data.data)) {
    console.log('✅ Found', data.data.length, 'images')
    return data.data
  }

  if (Array.isArray(data.data)) {
    console.log('✅ Found', data.data.length, 'images')
    return data.data
  }

  if (Array.isArray(data)) {
    console.log('✅ Found', data.length, 'images')
    return data
  }

  // No images found
  console.log('⚠️ No images in response')
  return []
}

/**
 * Get the full URL for a kos image
 * Helper function to construct image URL from KosImage object
 */
export const getKosImageUrl = (image: KosImage): string => {
  console.log('🔍 Processing image:', image)
  
  // The 'file' field might be:
  // 1. Full URL: https://example.com/path/to/image.jpg
  // 2. Relative path: kos_images/images/xxx.jpg (from API)
  
  if (!image.file) {
    console.warn('⚠️ No file field in image object')
    return '/placeholder.svg'
  }
  
  // Already a full URL
  if (image.file.startsWith('http://') || image.file.startsWith('https://')) {
    console.log('✅ Full URL detected:', image.file)
    return image.file
  }
  
  // Construct full URL using backend base
  const baseUrl = 'https://learn.smktelkom-mlg.sch.id/kos'
  
  // Remove leading slash if present
  const cleanPath = image.file.startsWith('/') ? image.file.slice(1) : image.file
  
  // API returns path like: kos_images/images/1762548692_graha-selaras.webp
  // Just append directly to base URL
  const finalUrl = `${baseUrl}/${cleanPath}`
  
  console.log('🖼️ Generated URL:', finalUrl)
  return finalUrl
}

/**
 * Delete a kos
 * DELETE /api/admin/delete_kos/{kosId}
 */
export const deleteKos = async (kosId: number): Promise<void> => {
  const token = getAuthToken()
  const makerId = getMakerId()
  
  if (!token) {
    throw new Error('No authentication token found. Please login first.')
  }
  
  // API_BASE_URL already includes /api, so just use /admin/delete_kos/{id}
  const endpoint = `/admin/delete_kos/${kosId}`
  const fullUrl = `${API_BASE_URL}${endpoint}`
  
  console.log('🗑️ Deleting kos:', { kosId, endpoint, fullUrl })

  const response = await fetch(fullUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'MakerID': makerId,
      'Authorization': `Bearer ${token}`,
    },
  })

  console.log('📥 Delete response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Delete error:', errorText)
    
    try {
      const errorData = JSON.parse(errorText)
      throw new Error(errorData.message || errorText || 'Failed to delete kos')
    } catch {
      throw new Error(errorText || 'Failed to delete kos')
    }
  }

  const text = await response.text()
  console.log('✅ Kos deleted successfully:', text)
  
  // Try to parse response, but don't fail if it's empty
  try {
    return JSON.parse(text)
  } catch {
    return
  }
}
