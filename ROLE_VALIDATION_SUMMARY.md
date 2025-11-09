# Role Validation Implementation Summary

## ✅ Implementasi yang Sudah Selesai

### 1. **Auth Library Updates** (`lib/auth.ts`)
- ✅ Menambahkan type `UserRole` (society | owner)
- ✅ Fungsi `getUserRole()` - mendapatkan role dari localStorage
- ✅ Fungsi `hasRole(role)` - cek apakah user punya role tertentu
- ✅ Fungsi `isOwner()` - cek apakah user adalah owner
- ✅ Fungsi `isSociety()` - cek apakah user adalah society
- ✅ Update `saveAuthTokens()` untuk menyimpan role
- ✅ Update `clearAuthTokens()` untuk hapus role

### 2. **Login Pages - Role Validation**

#### Owner Login (`app/(owner)/owner/login/page.tsx`)
- ✅ Validasi role setelah login
- ✅ Jika role bukan 'owner', tampilkan alert dan tolak akses
- ✅ Simpan role 'owner' ke localStorage
- ✅ Simpan token ke `authToken` dan `token` untuk konsistensi

#### Society Login (`app/(society)/auth/login/page.tsx`)
- ✅ Validasi role setelah login
- ✅ Jika role bukan 'society', tampilkan alert dan tolak akses
- ✅ Simpan role 'society' ke localStorage
- ✅ Simpan token ke `authToken` dan `token` untuk konsistensi

### 3. **Auth Guard Component** (`components/auth-guard.tsx`)
- ✅ `AuthGuard` - komponen universal untuk proteksi route berdasarkan role
- ✅ `OwnerGuard` - wrapper khusus untuk halaman owner
- ✅ `SocietyGuard` - wrapper khusus untuk halaman society
- ✅ Auto redirect jika role tidak sesuai
- ✅ Alert notification untuk user
- ✅ Loading state saat checking authentication

### 4. **Protected Pages**

#### Owner Pages (memerlukan role 'owner'):
- ✅ `/owner/dashboard` - Dashboard owner
- ✅ `/owner/facilities` - Manajemen fasilitas

#### Society Pages (memerlukan role 'society'):
- ✅ `/` - Homepage (list kos)
- ✅ `/profile` - Profile page

### 5. **Logout Functionality**
- ✅ Owner Dashboard - clear semua data termasuk role
- ✅ User Nav - clear semua data termasuk role
- ✅ Menghapus: token, authToken, currentUser, userRole, makerId

### 6. **API Updates** (`lib/api/kos-api.ts`)
- ✅ Import `getUserRole` dari auth
- ✅ Log role saat fetch data (untuk debugging)

## ⚠️ Masalah Backend yang Perlu Diperbaiki

### Issue: Society tidak bisa akses `/admin/show_kos`

**Error Response:**
```json
{
  "status": false,
  "message": "anda tidak memiliki akses untuk halaman ini"
}
```

**Root Cause:**
Backend API menolak akses society ke endpoint `/admin/show_kos` dengan response 401 Unauthorized.

**Solutions (Pilih salah satu):**

### Option 1: Backend Perlu Update Endpoint `/admin/show_kos` ✨ (RECOMMENDED)
Backend harus mengizinkan society mengakses `/admin/show_kos` tetapi return data berbeda:

```php
// Di backend Laravel/PHP
public function showKos(Request $request) {
    $user = auth()->user();
    
    if ($user->role === 'owner') {
        // Owner: hanya return kos miliknya
        $kos = Kos::where('user_id', $user->id)->get();
    } else if ($user->role === 'society') {
        // Society: return semua kos yang tersedia
        $kos = Kos::where('status', 'available')->get();
    }
    
    return response()->json([
        'status' => true,
        'data' => $kos
    ]);
}
```

### Option 2: Backend Buat Endpoint Baru untuk Society
Buat endpoint terpisah untuk society:
- `/society/show_kos` - untuk list semua kos
- `/society/detail_kos/{id}` - untuk detail kos

Kemudian update frontend:
```typescript
const endpoint = userRole === 'owner' ? '/admin/show_kos' : '/society/show_kos'
```

### Option 3: Endpoint Public tanpa Auth
Buat endpoint public yang tidak perlu authentication:
- `/public/kos` - list kos
- `/public/kos/{id}` - detail kos

## 🔒 Cara Kerja Role Validation

### Registration Flow:
1. User/Owner register dengan role specific ('society' atau 'owner')
2. Backend menyimpan role di database
3. Role disertakan dalam response login

### Login Flow:
1. User input email & password
2. API authenticate dan return token + user data (termasuk role)
3. Frontend validasi role:
   - Jika login di Owner page tapi role = 'society' → TOLAK + Alert
   - Jika login di Society page tapi role = 'owner' → TOLAK + Alert
4. Jika valid, simpan token + role ke localStorage
5. Redirect ke dashboard yang sesuai

### Page Access Flow:
1. User mencoba akses protected page
2. AuthGuard check:
   - Apakah ada token? Tidak → redirect ke login
   - Apakah role sesuai? Tidak → redirect + alert
   - Ya → render page

### API Request Flow:
1. Frontend ambil token + role dari localStorage
2. Tentukan endpoint berdasarkan role (jika berbeda)
3. Kirim request dengan Bearer token
4. Backend validasi token + role
5. Return data sesuai role

## 📝 Testing Checklist

### Test Society User:
- [ ] Register sebagai society (role='society')
- [ ] Login di `/auth/login`
- [ ] Bisa akses homepage `/`
- [ ] Bisa akses profile `/profile`
- [ ] TIDAK bisa akses `/owner/dashboard` (redirect + alert)
- [ ] TIDAK bisa akses `/owner/facilities` (redirect + alert)
- [ ] Logout berhasil clear semua data

### Test Owner User:
- [ ] Register sebagai owner (role='owner')
- [ ] Login di `/owner/login`
- [ ] Bisa akses dashboard `/owner/dashboard`
- [ ] Bisa akses facilities `/owner/facilities`
- [ ] TIDAK bisa akses `/` homepage society (redirect + alert)
- [ ] TIDAK bisa akses `/profile` (redirect + alert)
- [ ] Logout berhasil clear semua data

### Test Cross-login Attempt:
- [ ] Owner try login di `/auth/login` → dapat alert
- [ ] Society try login di `/owner/login` → dapat alert
- [ ] Setelah alert, tetap di halaman login (tidak redirect)

## 🚀 Next Steps

1. **Koordinasi dengan Backend Developer:**
   - Diskusikan implementasi role-based access di endpoint `/admin/show_kos`
   - Pastikan response API include field `role` dalam user data
   - Test dengan postman/insomnia sebelum integrate

2. **Test Thoroughly:**
   - Test semua skenario di Testing Checklist
   - Test dengan real API response
   - Test error handling

3. **Additional Features (Optional):**
   - Middleware di Next.js untuk server-side role check
   - Refresh token mechanism
   - Role-based UI rendering (hide/show features)

## 📞 Support

Jika ada issue atau pertanyaan:
1. Check console.log untuk debug info (role, token, endpoint)
2. Check Network tab di DevTools untuk API response
3. Verify localStorage berisi: `token`, `authToken`, `userRole`, `currentUser`

---
**Last Updated:** 7 November 2025
**Status:** ✅ Frontend Implementation Complete | ⏳ Waiting for Backend Updates
