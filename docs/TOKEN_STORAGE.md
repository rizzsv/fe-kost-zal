# 🔐 Token Storage Guide

## Token Keys yang Digunakan

Aplikasi ini menggunakan dua key berbeda untuk menyimpan token di localStorage:

### 1. Owner Dashboard
- **Key**: `token`
- **Usage**: Halaman owner (`/owner/dashboard`)
- **Set at**: Owner login page

```javascript
// Di halaman owner login
localStorage.setItem('token', responseData.token)
```

### 2. User Dashboard
- **Key**: `authToken`
- **Usage**: Halaman user/society (`/`)
- **Set at**: User login page

```javascript
// Di halaman user login
localStorage.setItem('authToken', responseData.token)
```

## Compatibility

Function `getAuthToken()` di `lib/auth.ts` sudah di-update untuk mendukung **kedua key**:

```typescript
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  // Try 'authToken' first (user), then 'token' (owner)
  return localStorage.getItem('authToken') || localStorage.getItem('token')
}
```

Ini berarti:
- ✅ Owner yang login dengan key `token` bisa mengakses API
- ✅ User yang login dengan key `authToken` bisa mengakses API
- ✅ Tidak perlu mengubah kode existing di owner dashboard

## Cara Testing

### Testing sebagai Owner
```javascript
// Set token sebagai owner
localStorage.setItem('token', 'your-owner-token')
localStorage.setItem('makerId', '1')

// Refresh dan cek
location.reload()
```

### Testing sebagai User
```javascript
// Set token sebagai user
localStorage.setItem('authToken', 'your-user-token')
localStorage.setItem('makerId', '1')

// Refresh dan cek
location.reload()
```

## Troubleshooting

### "No authentication token found"

**Solusi:**
1. Buka browser console
2. Cek apakah token tersimpan:
```javascript
console.log('Owner token:', localStorage.getItem('token'))
console.log('User token:', localStorage.getItem('authToken'))
console.log('MakerID:', localStorage.getItem('makerId'))
```

3. Jika tidak ada, set manual untuk testing:
```javascript
// Untuk owner
localStorage.setItem('token', 'your-token-here')

// Untuk user
localStorage.setItem('authToken', 'your-token-here')

// Set makerId (required)
localStorage.setItem('makerId', '1')
```

### Token ada tapi masih error

**Kemungkinan penyebab:**
1. Token expired - login ulang untuk mendapat token baru
2. Token invalid - cek format token benar
3. MakerID tidak diset - pastikan `localStorage.getItem('makerId')` ada

## Rekomendasi untuk Production

Untuk konsistensi, sebaiknya standardisasi menggunakan satu key saja:

### Pilihan 1: Gunakan 'token' untuk semua
```typescript
// Update lib/auth.ts
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

// Update semua halaman login untuk set dengan key 'token'
```

### Pilihan 2: Gunakan 'authToken' untuk semua
```typescript
// Update owner dashboard untuk gunakan 'authToken'
// Di halaman owner login:
localStorage.setItem('authToken', responseData.token)

// Update lib/auth.ts
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}
```

## Current Implementation Status

✅ **Working**: Kedua key (`token` dan `authToken`) didukung
✅ **Backward Compatible**: Tidak break existing owner dashboard
✅ **Flexible**: Bisa digunakan untuk owner dan user
⚠️ **Todo**: Standardisasi ke satu key untuk production

## Example: Unified Token Storage

Jika ingin unifikasi, buat helper function:

```typescript
// lib/auth.ts
export function saveToken(token: string, makerId: string = '1'): void {
  if (typeof window === 'undefined') return
  
  // Save with standardized key
  localStorage.setItem('token', token)
  localStorage.setItem('makerId', makerId)
  
  // Remove old keys if any
  localStorage.removeItem('authToken')
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}
```

Lalu update semua login pages untuk gunakan `saveToken()`.
