"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"

const API_URL = "https://learn.smktelkom-mlg.sch.id/kos/api/register"

async function registerSociety(payload: { name: string; email: string; phone: string; password: string; role: string }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      makerID: "1",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    // try parse JSON validation errors, otherwise throw text
    try {
      const body = await res.json()
      // throw the parsed body so caller can inspect validation fields
      throw body
    } catch (err) {
      const text = await res.text()
      throw new Error(text || "Register failed")
    }
  }

  return res.json()
}

export default function SocietyRegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null)
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: { name: string; email: string; phone: string; password: string; role: string }) =>
      registerSociety({ ...data }),
    onSuccess: () => {
      router.push("/auth/login")
    },
    onError(err) {
      // if the API returned a validation object, capture it
      if (err && typeof err === "object" && !((err as Error).message)) {
        setErrors(err as unknown as Record<string, string[]>)
      } else {
        setErrors(null)
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors(null)
    mutation.mutate({ ...formData, role: "society" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Nama Lengkap"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              placeholder="No. Telepon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button type="submit" className="w-full" disabled={mutation.status === 'pending'}>
              {mutation.status === 'pending' ? "Mendaftarkan..." : "Daftar"}
            </Button>
          </form>

          {mutation.status === 'error' && (
            <p className="text-sm text-red-600 mt-3">{(mutation.error as Error)?.message || "Terjadi kesalahan"}</p>
          )}

          <p className="text-center text-sm mt-4">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="text-blue-600 font-semibold">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
