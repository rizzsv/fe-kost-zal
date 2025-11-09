# Setup Admin Browse Token untuk Society

## 🎯 Tujuan
Society perlu melihat daftar kos, tetapi backend hanya menyediakan endpoint `/admin/show_kos` yang memerlukan token owner. Solusinya adalah menggunakan token owner (admin) khusus untuk browsing (read-only).

## 📋 Langkah Setup

### Cara 1: Menggunakan Token Owner yang Sudah Ada

1. **Login sebagai Owner**
   - Buka browser
   - Akses `/owner/login`
   - Login dengan akun owner yang valid

2. **Ambil Token dari LocalStorage**
   - Buka Console (tekan F12)
   - Ketik command ini:
   ```javascript
   localStorage.getItem('token')
   ```
   - Copy token yang muncul (panjang, dimulai dengan `eyJ...`)

3. **Simpan ke Environment Variable**
   - Buka file `.env.local` di root project
   - Paste token ke variable:
   ```env
   NEXT_PUBLIC_ADMIN_BROWSE_TOKEN=eyJxxxxx_token_yang_dicopy_tadi_xxxxx
   ```

4. **Restart Development Server**
   ```bash
   # Stop server (Ctrl+C)
   # Start ulang
   pnpm dev
   # atau
   npm run dev
   ```

### Cara 2: Request Token Baru dari Backend (Jika Ada Endpoint)

Jika backend menyediakan endpoint untuk generate token khusus browsing:

```bash
curl -X POST https://learn.smktelkom-mlg.sch.id/kos/api/generate-browse-token \
  -H "Content-Type: application/json" \
  -d '{"purpose": "public-browse"}'
```

Simpan token yang dikembalikan ke `.env.local`

### Cara 3: Hardcode Temporary Token (Development Only)

**⚠️ HANYA UNTUK DEVELOPMENT - JANGAN DI PRODUCTION!**

Jika Anda memiliki token owner yang tidak expire:

```typescript
// lib/env.ts
export const env = {
  apiBaseUrl: 'https://learn.smktelkom-mlg.sch.id/kos/api',
  // Temporary - ganti dengan token valid
  adminBrowseToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOi...',
} as const
```

## 🔒 Keamanan

### Yang Aman:
✅ Token hanya digunakan untuk READ (melihat kos)
✅ Society tetap tidak bisa CRUD kos
✅ Society tidak bisa akses fitur owner lainnya
✅ Token disimpan di environment variable (tidak di-commit)

### Yang TIDAK Aman:
❌ Jangan hardcode token di code yang di-commit
❌ Jangan share token di public repository
❌ Jangan gunakan token owner utama (gunakan token khusus jika ada)

## 🧪 Testing

### Test 1: Society Browse Kos
```bash
# 1. Setup token di .env.local
# 2. Restart server
# 3. Login sebagai society
# 4. Browse homepage
# Expected: Bisa melihat list kos ✅
```

### Test 2: Society Tidak Bisa Akses Owner Features
```bash
# 1. Login sebagai society
# 2. Coba akses /owner/dashboard
# Expected: Redirect + Alert ✅
```

### Test 3: Owner Tetap Gunakan Token Sendiri
```bash
# 1. Login sebagai owner
# 2. Akses /owner/dashboard
# Expected: Gunakan token owner pribadi, bukan admin browse token ✅
```

## 🐛 Troubleshooting

### Error: "token tidak ditemukan / token invalid"

**Problem:** Token admin browse belum diset atau sudah expire

**Solution:**
1. Check `.env.local`:
   ```bash
   cat .env.local | grep ADMIN_BROWSE_TOKEN
   ```
2. Pastikan token ada dan tidak kosong
3. Coba dapatkan token baru dengan login owner
4. Restart development server setelah update

### Error: "Cannot read properties of undefined"

**Problem:** Environment variable tidak terbaca

**Solution:**
1. Pastikan file `.env.local` ada di root project
2. Pastikan nama variable benar: `NEXT_PUBLIC_ADMIN_BROWSE_TOKEN`
3. Restart development server
4. Clear browser cache dan localStorage

### Token Expire

**Problem:** Token JWT biasanya punya expiration time

**Solution:**
```javascript
// Option 1: Update token secara manual (login ulang sebagai owner)
// Option 2: Implement auto-refresh token
// Option 3: Request long-lived token dari backend
```

## 📝 Alternative Solutions

### Solution 1: Backend Buat Endpoint Public
Backend buat endpoint baru tanpa auth:
- `/public/kos` - list kos
- `/public/kos/:id` - detail kos

### Solution 2: Backend Implementasi Service Account
Backend buat service account khusus dengan permission read-only.

### Solution 3: Backend Return All Kos untuk Society Token
Backend modifikasi endpoint `/admin/show_kos` untuk accept society token dan return all kos.

## 🎬 Quick Start Commands

```bash
# 1. Login as owner and get token
# In browser console:
localStorage.getItem('token')

# 2. Copy token and add to .env.local
echo "NEXT_PUBLIC_ADMIN_BROWSE_TOKEN=<paste_token_here>" >> .env.local

# 3. Restart server
pnpm dev

# 4. Login as society and test
# Should see kos list now! ✅
```

## 📞 Support

Jika masih ada masalah:
1. Check console log untuk error detail
2. Verify token valid dengan test di Postman/Insomnia:
   ```
   GET https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_kos
   Headers:
     Authorization: Bearer <your_token>
     MakerID: 1
   ```
3. Pastikan role society tersimpan dengan benar: `localStorage.getItem('userRole')`

---

**Last Updated:** 8 November 2025
**Status:** Ready to Use (Need Token Setup)
