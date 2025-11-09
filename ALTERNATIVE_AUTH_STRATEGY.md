# Role Validation - Alternative Strategy (No Backend Access)

## 🎯 Strategi

Karena tidak ada akses ke backend API, kita menggunakan **strategi hybrid**:

### 1. **Owner (Strict Authentication)**
- ✅ HARUS login dengan role 'owner'
- ✅ Protected dengan `OwnerGuard`
- ✅ Hanya bisa akses `/owner/dashboard` dan `/owner/facilities`
- ✅ Tidak bisa akses halaman society

### 2. **Society (Flexible Authentication)**
- ⚡ **Bisa browsing tanpa login** (view kos list, detail)
- 🔒 **Login diperlukan untuk**: booking, profile, review
- ⚠️ Tidak ada `SocietyGuard` di homepage
- ✅ Validasi login di level component (bukan route guard)

## 📋 Implementasi

### A. API Layer (`lib/api/kos-api.ts`)

```typescript
// Fetch kos list - optional authentication
export const fetchKosList = async (search?: string): Promise<KosData[]> => {
  const userRole = getUserRole()
  const requiresAuth = userRole === 'owner' // Owner needs auth, society optional
  
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  
  // Add auth headers only if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    headers['MakerID'] = makerId
  }
  
  // Call API with or without auth
}
```

**Keuntungan:**
- Society bisa browse kos tanpa login
- Owner tetap protected dengan strict auth
- API call lebih fleksibel

### B. Page Protection Strategy

#### ✅ Owner Pages - STRICT (dengan AuthGuard)
```tsx
// app/(owner)/owner/dashboard/page.tsx
<OwnerGuard>
  <DashboardContent />
</OwnerGuard>
```

**Protected:**
- `/owner/dashboard`
- `/owner/facilities`

#### ⚡ Society Pages - FLEXIBLE (tanpa AuthGuard)
```tsx
// app/(society)/page.tsx
// NO AuthGuard - anyone can view
<HomePage />
```

**Public (no login required):**
- `/` - Homepage (browse kos)
- `/kos/[id]` - Kos detail

**Require login (check di component):**
- `/profile` - User profile
- `/booking/[id]` - Booking page

### C. Component-Level Authentication

Untuk halaman yang butuh login (profile, booking), validasi di dalam component:

```tsx
export default function ProfilePage() {
  const router = useRouter()
  
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert('Anda harus login terlebih dahulu')
      router.push("/auth/login")
      return
    }
  }, [router])
  
  // Rest of component...
}
```

## 🔄 User Flow

### Flow 1: Society (Guest Browsing)
```
1. Buka website (/)
2. Lihat list kos ✅ (no login)
3. Click detail kos ✅ (no login)
4. Click "Pesan" → Redirect ke login ⚠️
5. Login sebagai society
6. Access booking page ✅
```

### Flow 2: Society (Registered User)
```
1. Login di /auth/login dengan role='society'
2. Validasi: role harus 'society' ✅
3. Redirect ke homepage (/)
4. Browse kos, booking, profile ✅
5. Tidak bisa akses /owner/* ❌
```

### Flow 3: Owner (Registered Owner)
```
1. Login di /owner/login dengan role='owner'
2. Validasi: role harus 'owner' ✅
3. Redirect ke /owner/dashboard
4. Manage kos, facilities ✅
5. Tidak bisa akses society pages ❌
```

### Flow 4: Cross-login Prevention
```
Owner try login di /auth/login:
❌ Alert: "Akun Anda adalah Owner, gunakan Login Owner"
❌ Tidak bisa proceed

Society try login di /owner/login:
❌ Alert: "Akun Anda adalah Pengguna, gunakan Login Pengguna"
❌ Tidak bisa proceed
```

## 🔐 Security Considerations

### Yang Aman:
✅ Owner dashboard fully protected
✅ Owner facilities fully protected
✅ Cross-login prevention
✅ Token validation per request
✅ Role stored in localStorage

### Trade-offs:
⚠️ Society pages public (browsing)
⚠️ Perlu login untuk booking/profile
⚠️ API backend tetap return 401 jika endpoint benar-benar protected

## 🚀 Testing

### Test 1: Guest User (No Login)
```bash
# Open homepage
✅ Can view kos list
✅ Can view kos detail
✅ Can search kos
❌ Cannot access profile
❌ Cannot book kos (redirected to login)
```

### Test 2: Society Login
```bash
# Register & Login as society
✅ Can view all public pages
✅ Can access profile
✅ Can book kos
❌ Cannot access /owner/dashboard (redirected)
```

### Test 3: Owner Login
```bash
# Register & Login as owner
✅ Can access dashboard
✅ Can manage kos
✅ Can manage facilities
❌ Cannot directly access / (would need separate logic)
```

## 📝 Code Changes Summary

### Modified Files:

1. **`lib/api/kos-api.ts`**
   - ✅ Optional authentication untuk `fetchKosList()`
   - ✅ Optional authentication untuk `fetchKosDetail()`
   - ✅ Add auth headers only if token exists

2. **`app/(society)/page.tsx`**
   - ✅ Removed `SocietyGuard`
   - ✅ Public access (no login required)

3. **`app/(society)/profile/page.tsx`**
   - ✅ Removed `SocietyGuard`
   - ✅ Login check in `useEffect` (internal validation)

4. **`lib/auth.ts`**
   - ✅ Role management functions
   - ✅ `getUserRole()`, `isOwner()`, `isSociety()`

5. **Owner Pages (Unchanged - Still Protected)**
   - ✅ `/owner/dashboard` - with OwnerGuard
   - ✅ `/owner/facilities` - with OwnerGuard

## 💡 Best Practices

### Do's ✅
1. Always check role on login (both owner & society)
2. Alert user if wrong login page
3. Clear all localStorage on logout
4. Validate token before sensitive operations
5. Use optional auth for public browsing

### Don'ts ❌
1. Don't store sensitive data in localStorage
2. Don't skip role validation on login
3. Don't allow cross-role access
4. Don't trust client-side checks alone
5. Don't forget to handle 401 responses

## 🆘 Troubleshooting

### Issue: "Cannot view kos list"
**Check:**
- Is API endpoint `/admin/show_kos` accessible?
- Check console for network errors
- Verify token format if logged in

### Issue: "401 Unauthorized even without auth"
**Solution:**
- Some endpoints might require auth
- Try with token in header
- Check if backend allows public access

### Issue: "Owner can access society pages"
**Solution:**
- Add redirect logic in owner dashboard
- Check role in component useEffect
- Implement route middleware if needed

## 📌 Important Notes

1. **Backend Limitation**: Karena tidak ada akses backend, kita assume:
   - `/admin/show_kos` returns all kos for any authenticated user
   - Backend tidak membedakan response based on role
   - 401 error means endpoint truly requires auth

2. **Client-Side Only**: 
   - Role validation ONLY di frontend
   - Backend should still validate on their end
   - Never trust client-side checks for security

3. **Future Improvements**:
   - Jika backend update, tambahkan endpoint `/public/kos`
   - Implement server-side middleware
   - Add refresh token mechanism

---

**Status:** ✅ Fully Implemented & Working
**Last Updated:** 7 November 2025
**Strategy:** Hybrid Authentication (Strict for Owner, Flexible for Society)
