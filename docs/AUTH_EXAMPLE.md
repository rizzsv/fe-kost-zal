# Example: Menggunakan Auth Helper di Login

Berikut contoh cara menggunakan auth helper di halaman login:

## Di halaman Login (`app/(society)/auth/login/page.tsx`)

```typescript
import { saveAuthTokens, saveCurrentUser } from '@/lib/auth'

// Setelah API login berhasil
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('API_LOGIN_URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Simpan token dan maker ID
      saveAuthTokens(data.token, data.makerId || '1')
      
      // Simpan data user
      saveCurrentUser({
        name: data.user.name,
        email: data.user.email,
        id: data.user.id
      })
      
      // Redirect ke dashboard
      router.push('/')
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

## Di halaman Logout

```typescript
import { logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const handleLogout = () => {
  logout() // Clear semua auth data
  router.push('/auth/login')
}
```

## Untuk Development/Testing

Jika ingin test tanpa login, bisa set token manual di browser console:

```javascript
// Di browser console
localStorage.setItem('authToken', 'your-test-token-here')
localStorage.setItem('makerId', '1')
localStorage.setItem('currentUser', JSON.stringify({
  name: 'Test User',
  email: 'test@example.com'
}))

// Refresh halaman
location.reload()
```
