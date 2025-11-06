"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { X } from "lucide-react"

async function updateKost(kosId: number, payload: { user_id: string; name: string; address: string; price_per_month: number; gender: string }) {
  const token = localStorage.getItem("token")
  const API_URL = `https://learn.smktelkom-mlg.sch.id/kos/api/admin/update_kos/${kosId}`
  
  console.log("Updating kos ID:", kosId)
  console.log("Update payload:", payload)
  console.log("API URL:", API_URL)
  console.log("Token:", token ? "exists" : "missing")
  
  const res = await fetch(API_URL, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json", 
      "makerID": "1",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  })
  
  const text = await res.text()
  console.log("Update kos response:", text)
  
  if (!res.ok) {
    try {
      const errorData = JSON.parse(text)
      throw new Error(errorData.message || text || "Gagal mengupdate kos")
    } catch {
      throw new Error(text || "Gagal mengupdate kos")
    }
  }
  
  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Invalid response format")
  }
}

interface EditKostModalProps {
  kos: {
    id: number
    user_id: string | number
    name: string
    address: string
    price_per_month: string | number
    gender: string
  }
  onClose: () => void
  onSuccess: () => void
}

export default function EditKostModal({ kos, onClose, onSuccess }: EditKostModalProps) {
  const [form, setForm] = React.useState({
    name: kos.name,
    address: kos.address,
    price: String(kos.price_per_month),
    gender: kos.gender === "all" ? "male" : kos.gender, // API might return "all", convert to valid option
  })

  const mutation = useMutation({
    mutationFn: (data: { user_id: string; name: string; address: string; price_per_month: number; gender: string }) =>
      updateKost(kos.id, data),
    onSuccess: (data) => {
      console.log("Kos updated successfully:", data)
      alert("Kos berhasil diupdate!")
      onSuccess()
      onClose()
    },
    onError: (error: Error) => {
      console.error("Error updating kos:", error)
      alert(error.message || "Gagal mengupdate kos")
    }
  })

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement
    setForm((s) => ({ ...s, [name]: value }))
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

    // Submit to API
    mutation.mutate({
      user_id: String(kos.user_id),
      name: form.name,
      address: form.address,
      price_per_month: parseInt(form.price),
      gender: form.gender,
    })
  }

  const inputClass = cn(
    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <Card className="relative w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Kos</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nama Kos</label>
              <Input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Nama kos (mis. Kos Nyaman)"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Alamat</label>
              <Input
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="Alamat / Lokasi"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Harga per Bulan</label>
              <Input
                name="price"
                value={form.price}
                onChange={onChange}
                placeholder="Harga / bulan (contoh: 500000)"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
              <select name="gender" value={form.gender} onChange={onChange} className={inputClass}>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={mutation.status === 'pending'}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700" 
                disabled={mutation.status === 'pending'}
              >
                {mutation.status === 'pending' ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
          
          {mutation.status === 'error' && (
            <p className="mt-2 text-sm text-red-600">
              {(mutation.error as Error)?.message || "Gagal mengupdate kos"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
