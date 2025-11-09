# Dashboard Fasilitas Kos - 3 Level

## 📋 Overview
Halaman dashboard untuk mengelola fasilitas kos dengan 3 tingkat kemewahan:
- **Mewah** (Premium) - Fasilitas kelas atas
- **Biasa** (Standard) - Fasilitas standar  
- **Sederhana** (Basic) - Fasilitas dasar

## 🎯 Fitur

### 1. Tampilan 3 Kolom
Setiap level ditampilkan dalam kolom terpisah dengan:
- Warna & icon yang berbeda
- Badge total fasilitas
- Form input untuk tambah fasilitas baru
- Daftar fasilitas yang dapat di-scroll

### 2. Operasi CRUD

#### ➕ Tambah Fasilitas
- Input nama fasilitas di kolom yang sesuai
- Tekan Enter atau klik tombol Plus
- API: `POST /store_facility/{level}`
- Body: `{ "facility_name": "nama" }`

#### ✏️ Edit Fasilitas
- Hover pada item fasilitas
- Klik icon Edit (pensil biru)
- Ketik nama baru, tekan Enter atau klik Save
- API: `PUT /update_facility/{id}`
- Body: `{ "facility_name": "nama_baru" }`

#### 🗑️ Hapus Fasilitas
- Hover pada item fasilitas
- Klik icon Trash (merah)
- Konfirmasi dialog
- API: `DELETE /delete_facility/{id}`

## 🔌 API Endpoints

Base URL: `https://learn.smktelkom-mlg.sch.id/kos/api`

### Headers (Semua Request)
```
Authorization: Bearer <token>
MakerID: 1
Content-Type: application/json
```

### 1. Add Facility
```bash
POST /store_facility/{level}
# level: mewah | biasa | sederhana

Body:
{
  "facility_name": "AC"
}
```

### 2. Update Facility
```bash
PUT /update_facility/{id}

Body:
{
  "facility_name": "AC + WiFi"
}
```

### 3. Get Detail
```bash
GET /detail_facility/{id}
```

### 4. Delete Facility
```bash
DELETE /delete_facility/{id}
```

## 🎨 Konfigurasi Level

### Mewah
- Warna: Purple gradient
- Icon: Sparkles (✨)
- Contoh: Pool, Gym, Smart TV, AC Central

### Biasa
- Warna: Blue gradient  
- Icon: Home (🏠)
- Contoh: WiFi, AC, TV, Kasur Standar

### Sederhana
- Warna: Green gradient
- Icon: CircleDot (⚫)
- Contoh: Kasur, Lemari, Kamar Mandi Dalam

## 🚀 Cara Akses

1. Login sebagai Owner
2. Buka Dashboard Owner (`/owner/dashboard`)
3. Klik menu "Kelola Fasilitas" di sidebar
4. Atau langsung ke `/owner/facilities`

## 💾 State Management

- **React Query** untuk mutations (add/update/delete)
- **Local state** untuk daftar fasilitas (useState)
- Auto-update UI setelah operasi berhasil

## 🔐 Authentication

Token diambil dari `localStorage.getItem('token')`
- Pastikan sudah login sebagai owner
- Token akan otomatis di-attach ke setiap API request

## 🐛 Debugging

Console logging otomatis aktif untuk:
- Request parameters
- Response status
- Error messages

Buka DevTools Console untuk melihat detail API calls.

## 📁 File Structure

```
lib/api/
  └── facility-api.ts          # API helper functions

app/(owner)/owner/
  ├── dashboard/
  │   └── page.tsx             # Link "Kelola Fasilitas"
  └── facilities/
      └── page.tsx             # Dashboard 3-level
```

## ⚠️ Notes

- Tidak ada endpoint `GET /show_facility/{level}` untuk fetch existing facilities
- Data facilities saat ini hanya di local state
- Refresh page akan reset daftar (sampai ada endpoint GET)
- ID fasilitas sementara menggunakan `Date.now()` untuk temporary

## 🔜 Future Improvements

1. Tambah endpoint GET untuk fetch existing facilities per level
2. Persist data dengan server-side state
3. Add loading skeleton
4. Add toast notifications (menggantikan alert())
5. Add drag-and-drop untuk reorder
6. Add bulk operations (delete multiple)
