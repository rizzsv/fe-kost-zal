/**
 * Quick Test Script for API
 * 
 * Cara menggunakan:
 * 1. Buka browser console di halaman aplikasi
 * 2. Copy paste script ini ke console
 * 3. Jalankan test functions
 */

// Set token untuk testing
function setTestToken(token: string, makerId = '1') {
  localStorage.setItem('authToken', token)
  localStorage.setItem('makerId', makerId)
  console.log('✅ Token set successfully!')
  console.log('Token:', token)
  console.log('MakerID:', makerId)
}

// Test fetch kos list
async function testFetchKosList(search = '') {
  console.log('🔍 Testing fetchKosList...')
  try {
    const { fetchKosList } = await import('@/lib/api/kos-api')
    const result = await fetchKosList(search)
    console.log('✅ Success! Data:', result)
    return result
  } catch (error) {
    console.error('❌ Error:', error)
    return null
  }
}

// Test fetch kos detail
async function testFetchKosDetail(id: number) {
  console.log(`🔍 Testing fetchKosDetail for ID: ${id}...`)
  try {
    const { fetchKosDetail } = await import('@/lib/api/kos-api')
    const result = await fetchKosDetail(id)
    console.log('✅ Success! Data:', result)
    return result
  } catch (error) {
    console.error('❌ Error:', error)
    return null
  }
}

// Check current auth status
function checkAuthStatus() {
  const token = localStorage.getItem('authToken')
  const makerId = localStorage.getItem('makerId')
  const user = localStorage.getItem('currentUser')
  
  console.log('📊 Auth Status:')
  console.log('- Token:', token ? '✅ Set' : '❌ Not set')
  console.log('- MakerID:', makerId || 'Not set')
  console.log('- User:', user ? JSON.parse(user) : 'Not set')
  
  return { token, makerId, user: user ? JSON.parse(user) : null }
}

// Clear all auth data
function clearAuth() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('makerId')
  localStorage.removeItem('currentUser')
  console.log('🗑️ All auth data cleared!')
}

// Export untuk digunakan di console
console.log(`
🧪 API Test Functions Available:

1. setTestToken(token, makerId)
   - Set token untuk testing
   - Example: setTestToken('your-token-here', '1')

2. testFetchKosList(search)
   - Test fetch list kos
   - Example: testFetchKosList('biru')

3. testFetchKosDetail(id)
   - Test fetch detail kos
   - Example: testFetchKosDetail(1)

4. checkAuthStatus()
   - Check current auth status

5. clearAuth()
   - Clear semua auth data

Quick Start:
  1. setTestToken('your-token-here')
  2. await testFetchKosList()
  3. await testFetchKosDetail(1)
`)

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).setTestToken = setTestToken;
  (window as any).testFetchKosList = testFetchKosList;
  (window as any).testFetchKosDetail = testFetchKosDetail;
  (window as any).checkAuthStatus = checkAuthStatus;
  (window as any).clearAuth = clearAuth;
}

export { setTestToken, testFetchKosList, testFetchKosDetail, checkAuthStatus, clearAuth }
