# 🔍 Quick Debug Guide

## Error: "Get data success" tapi masih error

Ini berarti API request berhasil, tapi ada masalah dengan **format response**.

### Step 1: Cek Console Log

Setelah refresh halaman, buka browser console (F12) dan cari log berikut:

```
API Response: {...}
Response type: ...
Has success field: ...
Has data field: ...
data.data is array: ...
```

### Step 2: Identifikasi Format Response

Berdasarkan log di atas, API Anda mengembalikan salah satu format ini:

#### ✅ Format 1: Standard Success Response
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Kos A", ... },
    { "id": 2, "name": "Kos B", ... }
  ]
}
```

#### ✅ Format 2: Data Only
```json
{
  "data": [
    { "id": 1, "name": "Kos A", ... },
    { "id": 2, "name": "Kos B", ... }
  ]
}
```

#### ✅ Format 3: Direct Array
```json
[
  { "id": 1, "name": "Kos A", ... },
  { "id": 2, "name": "Kos B", ... }
]
```

#### ❌ Format 4: Success Without Data
```json
{
  "success": true,
  "message": "Get data success"
}
```
**Problem**: Data array kosong atau tidak ada!

### Step 3: Manual Test di Console

Paste script ini di browser console untuk test manual:

```javascript
// Test fetch kos list
async function testAPI() {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken')
  const makerId = localStorage.getItem('makerId') || '1'
  
  console.log('🔑 Using token:', token)
  console.log('🔑 Using makerId:', makerId)
  
  const response = await fetch('https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_kos', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'MakerID': makerId,
      'Content-Type': 'application/json',
    }
  })
  
  console.log('📡 Response status:', response.status, response.statusText)
  
  const data = await response.json()
  
  console.log('📦 Full Response:', data)
  console.log('📦 Response keys:', Object.keys(data))
  console.log('📦 data.data:', data.data)
  console.log('📦 Is data.data array?', Array.isArray(data.data))
  console.log('📦 Array length:', data.data?.length)
  
  return data
}

// Run test
await testAPI()
```

### Step 4: Solusi Berdasarkan Hasil

#### Jika `data.data` adalah array kosong `[]`
**Penyebab**: Belum ada kos yang dibuat
**Solusi**: Buat kos baru dulu di owner dashboard

#### Jika `data.data` undefined tapi `data` ada isi lain
**Penyebab**: Format response berbeda dari yang expected
**Solusi**: Lihat format actual di console, lalu report ke developer

#### Jika response 401/403
**Penyebab**: Token invalid atau expired
**Solusi**: 
```javascript
// Login ulang atau set token baru
localStorage.setItem('token', 'your-new-token')
localStorage.setItem('makerId', '1')
location.reload()
```

### Step 5: Cek di Owner Dashboard

Jika error masih muncul, coba cek di owner dashboard apakah data kos muncul:

1. Buka: `http://localhost:3000/owner/dashboard`
2. Klik tab "Manajemen Kos"
3. Jika data muncul → berarti API OK, masalah di format parsing
4. Jika data tidak muncul → berarti memang belum ada data

### Common Issues

#### Issue 1: MakerID salah
```javascript
// Coba set MakerID yang berbeda
localStorage.setItem('makerId', '1')  // Coba 1, 2, 3, dst
location.reload()
```

#### Issue 2: Token format salah
```javascript
// Pastikan token tidak ada prefix 'Bearer '
const token = localStorage.getItem('token')
console.log('Token:', token)
// Jika ada 'Bearer ' di depan, remove:
localStorage.setItem('token', token.replace('Bearer ', ''))
```

#### Issue 3: CORS Error
**Cek console untuk error CORS**
**Solusi**: Backend harus enable CORS untuk localhost:3000

---

## Quick Commands

Copy paste ini ke console untuk quick checks:

```javascript
// 1. Check all auth data
console.log('Token:', localStorage.getItem('token'))
console.log('AuthToken:', localStorage.getItem('authToken'))
console.log('MakerID:', localStorage.getItem('makerId'))
console.log('User:', localStorage.getItem('currentUser'))

// 2. Clear all and start fresh
localStorage.clear()
location.reload()

// 3. Set test data
localStorage.setItem('token', 'your-token-here')
localStorage.setItem('makerId', '1')
location.reload()
```

---

**Setelah dapat hasil dari console log, share screenshot atau text log-nya untuk troubleshooting lebih lanjut!**
