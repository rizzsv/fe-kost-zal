import env from '@/lib/env'
import { getAuthToken, getMakerId } from '@/lib/auth'

const API_BASE_URL = env.apiBaseUrl

export interface Facility {
  id: number
  facility_name: string
  kos_id: number
}

// Add new facility to a specific kos
export const addFacility = async (kosId: number, facilityName: string): Promise<void> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('No authentication token found')
  }

  console.log('🔧 Adding facility:', { kosId, facilityName })

  // Try /admin/ prefix first (consistent with other endpoints)
  let response = await fetch(`${API_BASE_URL}/admin/store_facility/${kosId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'MakerID': makerId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      facility_name: facilityName
    })
  })

  console.log('📡 Add facility response:', response.status, response.statusText)
  console.log('📡 Request URL:', `${API_BASE_URL}/admin/store_facility/${kosId}`)
  console.log('📡 Request body:', JSON.stringify({ facility_name: facilityName }))

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Add Facility Error:', errorText)
    console.error('❌ Endpoint tried:', `${API_BASE_URL}/admin/store_facility/${kosId}`)
    throw new Error(`Failed to add facility (${response.status}): ${response.statusText}`)
  }

  console.log('✅ Facility added successfully')
}

// Get facilities for a specific kos
export const getFacilitiesByKos = async (kosId: number): Promise<Facility[]> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('No authentication token found')
  }

  console.log('🔍 Getting facilities for kos:', kosId)

  const response = await fetch(`${API_BASE_URL}/admin/show_facilities/${kosId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'MakerID': makerId,
      'Content-Type': 'application/json',
    }
  })

  console.log('📡 Get facilities response:', response.status, response.statusText)

  if (!response.ok) {
    // If 404, might mean no facilities yet - return empty array
    if (response.status === 404) {
      console.log('⚠️ No facilities found for this kos (404) - returning empty array')
      return []
    }
    
    const errorText = await response.text()
    console.error('❌ Get Facilities Error:', errorText)
    throw new Error(`Failed to get facilities: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('📦 Facilities:', data)
  
  // Handle different response formats
  if (Array.isArray(data)) return data
  if (data.data && Array.isArray(data.data)) return data.data
  
  return []
}

// Update existing facility
export const updateFacility = async (facilityId: number, facilityName: string): Promise<void> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('No authentication token found')
  }

  console.log('🔧 Updating facility:', { facilityId, facilityName })
  console.log('📤 Request URL:', `${API_BASE_URL}/update_facility/${facilityId}`)

  const response = await fetch(`${API_BASE_URL}/update_facility/${facilityId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'MakerID': makerId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      facility_name: facilityName
    })
  })

  console.log('� Update facility response:', response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Update Facility Error:', errorText)
    throw new Error(`Failed to update facility: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('✅ Facility updated successfully:', data)
}

// Get facility detail
export const getFacilityDetail = async (facilityId: number): Promise<Facility> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('No authentication token found')
  }

  console.log('🔍 Getting facility detail:', facilityId)
  console.log('📤 Request URL:', `${API_BASE_URL}/detail_facility/${facilityId}`)

  const response = await fetch(`${API_BASE_URL}/detail_facility/${facilityId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'MakerID': makerId,
    }
  })

  console.log('� Get facility response:', response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Get Facility Error:', errorText)
    throw new Error(`Failed to get facility detail: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('✅ Facility Detail:', data)
  
  // Handle different response formats
  if (data.status === true && data.data) return data.data
  if (data.success === true && data.data) return data.data
  if (data.data) return data.data
  return data
}

// Delete facility
export const deleteFacility = async (facilityId: number): Promise<void> => {
  const token = getAuthToken()
  const makerId = getMakerId()

  if (!token) {
    throw new Error('No authentication token found')
  }

  console.log('🗑️ Deleting facility:', facilityId)
  console.log('📤 Request URL:', `${API_BASE_URL}/delete_facility/${facilityId}`)

  const response = await fetch(`${API_BASE_URL}/delete_facility/${facilityId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'MakerID': makerId,
    }
  })

  console.log('� Delete facility response:', response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Delete Facility Error:', errorText)
    throw new Error(`Failed to delete facility: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('✅ Facility deleted successfully:', data)
}
