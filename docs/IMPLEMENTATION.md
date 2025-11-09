# 🏠 Kos Hunter - API Integration Complete

## 📋 Summary

Implementasi fetching data kost dari API untuk halaman dashboard user telah selesai dibuat dengan fitur-fitur berikut:

### ✅ Yang Sudah Dibuat

1. **API Service Layer** (`lib/api/kos-api.ts`)
   - Function `fetchKosList(search?)` - untuk mengambil daftar kost
   - Function `fetchKosDetail(id)` - untuk mengambil detail kost
   - Full TypeScript types untuk data kost
   - Error handling yang proper

2. **Authentication Helper** (`lib/auth.ts`)
   - `saveAuthTokens()` - simpan token dan maker ID
   - `getAuthToken()` - ambil token dari localStorage
   - `getMakerId()` - ambil maker ID dari localStorage
   - `saveCurrentUser()` - simpan data user
   - `getCurrentUser()` - ambil data user
   - `logout()` - clear semua auth data

3. **Updated Pages**
   - **Dashboard User** (`app/(society)/page.tsx`)
     - ✅ Fetch data kost dari API menggunakan React Query
     - ✅ Search functionality dengan debounce
     - ✅ Filter berdasarkan gender (male/female/mix)
     - ✅ Loading state
     - ✅ Error handling dengan pesan yang jelas
   
   - **Detail Kost** (`app/(society)/kos/[id]/page.tsx`)
     - ✅ Fetch detail kost dari API
     - ✅ Loading state
     - ✅ Error handling
     - ✅ Tampilan detail lengkap

4. **Configuration**
   - Environment configuration (`lib/env.ts`)
   - Example env file (`.env.example`)

5. **Documentation**
   - API Integration guide (`docs/API_INTEGRATION.md`)
   - Authentication example (`docs/AUTH_EXAMPLE.md`)
   - Test utilities (`lib/test-api.ts`)

---

## 🚀 Cara Menggunakan

### 1. Setup Token Authentication

**PENTING**: API service sudah mendukung kedua format token storage:
- `token` (untuk owner dashboard)
- `authToken` (untuk user dashboard)

**Untuk Development/Testing:**

**Jika Anda sudah login sebagai Owner:**
Token sudah tersimpan dengan key `token`, jadi API akan langsung bekerja!

**Jika ingin test manual, buka browser console:**

```javascript
// Untuk owner (key: 'token')
localStorage.setItem('token', 'your-bearer-token-here')
localStorage.setItem('makerId', '1')

// ATAU untuk user (key: 'authToken')
localStorage.setItem('authToken', 'your-bearer-token-here')
localStorage.setItem('makerId', '1')

// Set user info (optional)
localStorage.setItem('currentUser', JSON.stringify({
  name: 'Test User',
  email: 'test@example.com'
}))

// Refresh halaman
location.reload()
```

**Untuk Production:**
Implementasikan di halaman login:

```typescript
import { saveAuthTokens, saveCurrentUser } from '@/lib/auth'

// Setelah login berhasil
saveAuthTokens(responseData.token, responseData.makerId)
saveCurrentUser({
  name: responseData.user.name,
  email: responseData.user.email
})
```

### 2. Jalankan Development Server

```bash
pnpm dev
```

### 3. Akses Halaman Dashboard

- Dashboard user: http://localhost:3000
- Detail kost: http://localhost:3000/kos/[id]

---

## 📡 API Endpoints yang Digunakan

### 1. Show Kos (List)
```
GET /admin/show_kos?search={query}
Headers:
  - Authorization: Bearer {token}
  - MakerID: {makerId}
```

### 2. Detail Kos
```
GET /admin/detail_kos/{id}
Headers:
  - Authorization: Bearer {token}
  - MakerID: {makerId}
```

---

## 🎨 Fitur Dashboard User

### Halaman Utama (/)
- ✨ Search bar dengan debounce (500ms)
- 🔍 Filter berdasarkan gender (Putra/Putri/Campur)
- 📱 Responsive grid layout
- ⚡ Real-time data dari API
- 🔄 Loading spinner saat fetch data
- ❌ Error handling dengan pesan yang informatif
- 🏷️ Badge untuk menampilkan gender
- 💰 Format harga Rupiah
- ⭐ Rating dan review (jika ada)
- 📍 Alamat kost

### Halaman Detail (/kos/[id])
- 📷 Gambar kost
- 📝 Nama dan deskripsi
- 📍 Alamat lengkap
- 💰 Harga per bulan
- 👥 Gender kost (Putra/Putri/Campur)
- ⭐ Rating dan jumlah review
- 🏷️ Fasilitas yang tersedia
- 🔄 Loading state
- ❌ Error handling

---

## 🧪 Testing API

### Cara 1: Menggunakan Browser Console

```javascript
// 1. Set token
localStorage.setItem('authToken', 'your-token')
localStorage.setItem('makerId', '1')

// 2. Test fetch list
const response = await fetch('https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_kos', {
  headers: {
    'Authorization': 'Bearer your-token',
    'MakerID': '1'
  }
})
const data = await response.json()
console.log(data)

// 3. Test fetch detail
const detail = await fetch('https://learn.smktelkom-mlg.sch.id/kos/api/admin/detail_kos/1', {
  headers: {
    'Authorization': 'Bearer your-token',
    'MakerID': '1'
  }
})
const detailData = await detail.json()
console.log(detailData)
```

### Cara 2: Menggunakan Test Utilities

Lihat dokumentasi lengkap di `lib/test-api.ts`

---

## 📂 Struktur File yang Ditambahkan/Dimodifikasi

```
fe-kost-zal/
├── lib/
│   ├── api/
│   │   └── kos-api.ts          # ✨ NEW - API service layer
│   ├── auth.ts                  # ✨ NEW - Auth helpers
│   ├── env.ts                   # ✨ NEW - Environment config
│   └── test-api.ts              # ✨ NEW - Test utilities
├── app/(society)/
│   ├── page.tsx                 # ✏️ UPDATED - Dashboard with API
│   └── kos/[id]/
│       └── page.tsx             # ✏️ UPDATED - Detail with API
├── docs/
│   ├── API_INTEGRATION.md       # ✨ NEW - API documentation
│   ├── AUTH_EXAMPLE.md          # ✨ NEW - Auth examples
│   └── IMPLEMENTATION.md        # ✨ NEW - This file
└── .env.example                 # ✨ NEW - Example env file
```

---

## 🔧 Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **TanStack Query (React Query)** - Data fetching & caching
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **Lucide React** - Icons

---

## 📝 Notes

### Penting!
1. **Token harus valid** - Pastikan token yang digunakan masih aktif
2. **MakerID required** - API membutuhkan MakerID di header
3. **CORS** - Pastikan API backend mengizinkan CORS dari domain frontend

### Data Mapping
API mengembalikan field `address` dan `price_per_month`, yang di-mapping ke:
- `address` → ditampilkan sebagai lokasi kost
- `price_per_month` → ditampilkan sebagai harga per bulan

### React Query Caching
- Data di-cache otomatis oleh React Query
- Cache key: `['kosList', searchQuery]` dan `['kosDetail', id]`
- Retry: 1 kali jika request gagal

### Error Handling
Semua error akan ditampilkan dengan:
- Loading spinner saat fetching
- Error message yang jelas jika gagal
- Fallback message jika tidak ada data

---

## 🐛 Troubleshooting

### "No authentication token found"
**Solusi:**
```javascript
// Cek token di browser console
console.log('Owner token:', localStorage.getItem('token'))
console.log('User token:', localStorage.getItem('authToken'))
console.log('MakerID:', localStorage.getItem('makerId'))

// Jika sudah login sebagai owner, token seharusnya sudah ada
// Jika tidak ada, set manual untuk testing:
localStorage.setItem('token', 'your-token-here')
localStorage.setItem('makerId', '1')
```

**Note**: API service mendukung kedua key (`token` dan `authToken`), jadi jika Anda sudah login sebagai owner dengan key `token`, itu sudah cukup!

### "Failed to fetch kos list"
- Cek koneksi internet
- Pastikan API endpoint benar
- Pastikan token masih valid
- Cek CORS settings di backend

### Data tidak muncul
- Buka Network tab di DevTools
- Lihat response dari API
- Cek format response sesuai dengan TypeScript types

---

## 👨‍💻 Next Steps (Optional)

1. Implementasi login page yang proper
2. Add refresh token functionality
3. Add image upload untuk kost
4. Implement comments API
5. Add booking functionality
6. Add infinite scroll atau pagination
7. Add filters untuk harga dan fasilitas
8. Implement real-time updates dengan websocket

---

## 📞 Support

Jika ada pertanyaan atau masalah, silakan check:
- `docs/API_INTEGRATION.md` - API documentation
- `docs/AUTH_EXAMPLE.md` - Authentication examples
- `lib/test-api.ts` - Testing utilities

---

**Status**: ✅ Implementation Complete
**Date**: November 7, 2025
**Version**: 1.0.0
