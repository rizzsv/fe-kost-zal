"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"

const API_URL = "https://learn.smktelkom-mlg.sch.id/kos/api/admin/store_kos"

async function addKost(payload: { user_id: string; name: string; address: string; price_per_month: number; gender: string }) {
  const token = localStorage.getItem("token")
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "makerID": "1",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  })
  
  const text = await res.text()
  
  if (!res.ok) {
    try {
      const errorData = JSON.parse(text)
      throw new Error(errorData.message || text || "Gagal menambahkan kos")
    } catch {
      throw new Error(text || "Gagal menambahkan kos")
    }
  }
  
  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Invalid response format")
  }
}

export default function AddKostBar() {
  const [open, setOpen] = React.useState(false)

  const [form, setForm] = React.useState({ name: "", address: "", price: "", gender: "male", image: "" })
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (data: { user_id: string; name: string; address: string; price_per_month: number; gender: string }) =>
      addKost(data),
    onSuccess: () => {
      // Reset form after success
      setForm({ name: "", address: "", price: "", gender: "male", image: "" })
      setImageFile(null)
      setImagePreview(null)
      setOpen(false)
      alert("Kos berhasil ditambahkan! Halaman akan dimuat ulang.")
      // Reload page to show new data
      window.location.reload()
    },
    onError: (error: Error) => {
      alert(error.message || "Gagal menambahkan kos")
    }
  })

  React.useEffect(() => {
    // if user picked a file, create an object URL for preview
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImagePreview(url)
      return () => URL.revokeObjectURL(url)
    }
    // if no file but an image url provided, use that
    if (form.image) setImagePreview(form.image)
    else setImagePreview(null)
  }, [imageFile, form.image])

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement
    setForm((s) => ({ ...s, [name]: value }))
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0]
    if (file) {
      setImageFile(file)
      setForm((s) => ({ ...s, image: file.name }))
    }
  }

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    
    if (!form.name.trim() || !form.price.trim()) {
      alert("Nama dan harga wajib diisi")
      return
    }
    if (!/^[0-9]+$/.test(form.price)) {
      alert("Harga harus angka tanpa simbol (contoh: 500000)")
      return
    }

    // Get user_id from localStorage
    const currentUser = localStorage.getItem("currentUser")
    let userId = "1" // default
    
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        userId = user.id || user.user_id || "1"
      } catch {
        console.log("Failed to parse user data")
      }
    }

    // Submit to API
    mutation.mutate({
      user_id: userId,
      name: form.name,
      address: form.address,
      price_per_month: parseInt(form.price),
      gender: form.gender,
    })
  }

  // reuse input classes to style native select consistently
  const inputClass = cn(
    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  )

  return (
    <div className="flex items-start gap-4">
      {!open ? (
        <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setOpen(true)}>
          + Tambah Kos
        </Button>
      ) : (
        // Centered modal overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <Card className="relative w-full max-w-3xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">Tambah Kos Baru</h3>
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-start">
                <div className="md:col-span-2">
                  <Input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Nama kos (mis. Kos Nyaman)"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Alamat / Lokasi"
                  />
                </div>

                <div className="md:col-span-1">
                  <Input
                    name="price"
                    value={form.price}
                    onChange={onChange}
                    placeholder="Harga / bulan"
                  />
                </div>

                <div className="md:col-span-1">
                  <select name="gender" value={form.gender} onChange={onChange} className={inputClass}>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>

                <div className="md:col-span-3 mt-2">
                  <Input
                    name="image"
                    value={form.image}
                    onChange={onChange}
                    placeholder="URL gambar (opsional)"
                  />
                </div>

                <div className="md:col-span-3 mt-2">
                  <input type="file" accept="image/*" onChange={onFileChange} className={cn(inputClass, "py-1")} />
                </div>

                {/* image preview centered */}
                <div className="md:col-span-6 mt-3">
                  <div className="w-full h-48 bg-gray-50 rounded-md border flex items-center justify-center overflow-hidden">
                    {imagePreview || form.image ? (
                      // prefer file preview
                      <img src={imagePreview || form.image} alt="preview" className="object-cover w-full h-full" />
                    ) : (
                      <p className="text-sm text-muted-foreground">Preview gambar akan muncul di sini</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-6 flex gap-2 justify-end mt-4">
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={mutation.status === 'pending'}>
                    {mutation.status === 'pending' ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.status === 'pending'}>
                    Batal
                  </Button>
                </div>
              </form>
              {mutation.status === 'error' && (
                <p className="mt-2 text-sm text-red-600">
                  {(mutation.error as Error)?.message || "Gagal menambahkan kos"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
