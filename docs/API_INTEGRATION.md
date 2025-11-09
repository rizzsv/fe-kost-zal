# API Integration Guide

## Setup

### 1. Install Dependencies
Pastikan semua dependencies sudah terinstall:
```bash
pnpm install
```

### 2. Set Authentication Token
Sebelum menggunakan API, user harus login dan menyimpan token di localStorage:

```javascript
// Setelah login berhasil, simpan token
localStorage.setItem('authToken', '<your-bearer-token>')
localStorage.setItem('makerId', '1') // atau ID maker yang sesuai
```

## API Endpoints

### 1. Show Kos (List)
Mengambil daftar semua kos dengan optional search parameter.

**Endpoint:** `GET /admin/show_kos`

**Parameters:**
- `search` (optional): String untuk mencari kos berdasarkan nama

**Headers:**
- `Authorization`: Bearer Token
- `MakerID`: ID dari maker

**Example Usage:**
```typescript
import { fetchKosList } from '@/lib/api/kos-api'

// Fetch all kos
const kosList = await fetchKosList()

// Fetch with search
const searchResults = await fetchKosList('biru')
```

### 2. Detail Kos
Mengambil detail dari kos tertentu berdasarkan ID.

**Endpoint:** `GET /admin/detail_kos/:id`

**Headers:**
- `Authorization`: Bearer Token
- `MakerID`: ID dari maker

**Example Usage:**
```typescript
import { fetchKosDetail } from '@/lib/api/kos-api'

// Fetch kos detail with ID 1
const kosDetail = await fetchKosDetail(1)
```

## Data Types

### KosData
```typescript
interface KosData {
  id: number
  user_id: string
  name: string
  address: string
  price_per_month: number
  gender: "male" | "female" | "mix"
  image?: string
  rating?: number
  reviews?: number
  description?: string
  facilities?: number[]
}
```

## Using React Query

Aplikasi ini menggunakan `@tanstack/react-query` untuk data fetching:

```typescript
import { useQuery } from '@tanstack/react-query'
import { fetchKosList } from '@/lib/api/kos-api'

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['kosList', searchQuery],
    queryFn: () => fetchKosList(searchQuery),
    retry: 1,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.map(kos => (
        <div key={kos.id}>{kos.name}</div>
      ))}
    </div>
  )
}
```

## Error Handling

API akan throw error jika:
- Tidak ada authentication token
- Request gagal (network error, 404, 500, etc.)
- Response dari API menandakan error (`success: false`)

Pastikan untuk handle error dengan proper:

```typescript
const { data, error } = useQuery({
  queryKey: ['kosDetail', id],
  queryFn: () => fetchKosDetail(id),
  onError: (error) => {
    console.error('Failed to fetch kos:', error)
    // Show notification to user
  }
})
```

## Pages Using API

### 1. Home/Dashboard Page (`app/(society)/page.tsx`)
- Menampilkan list semua kos
- Fitur search dan filter berdasarkan gender
- Menggunakan `fetchKosList()`

### 2. Kos Detail Page (`app/(society)/kos/[id]/page.tsx`)
- Menampilkan detail kos berdasarkan ID
- Menggunakan `fetchKosDetail()`

## Notes

- Token disimpan di localStorage (untuk development)
- Untuk production, pertimbangkan menggunakan httpOnly cookies atau secure storage lainnya
- API base URL bisa dikonfigurasi melalui environment variables
- React Query melakukan caching otomatis, sehingga data tidak di-fetch ulang jika sudah ada di cache
