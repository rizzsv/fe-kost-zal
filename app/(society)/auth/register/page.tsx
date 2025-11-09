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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Left illustration */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="max-w-md text-white z-10 space-y-6 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Gratis & Mudah</span>
            </div>
            
            <h2 className="text-5xl font-bold leading-tight">
              Mulai Perjalanan Anda! ✨
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Daftar sekarang untuk menemukan dan memesan kos impian Anda dengan mudah dan aman.
            </p>
          </div>

          {/* Animated illustration */}
          <div className="relative w-full h-80 animate-float">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
              {/* Checklist illustration */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 animate-slide-right">
                  <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div className="flex-1 h-4 bg-white/20 rounded backdrop-blur"></div>
                </div>
                <div className="flex items-center gap-3 animate-slide-right delay-200">
                  <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div className="flex-1 h-4 bg-white/20 rounded backdrop-blur"></div>
                </div>
                <div className="flex items-center gap-3 animate-slide-right delay-300">
                  <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div className="flex-1 h-4 bg-white/20 rounded backdrop-blur"></div>
                </div>
              </div>
              
              {/* Profile cards illustration */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/20 rounded-xl p-4 backdrop-blur animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                    <div className="w-12 h-12 bg-white/30 rounded-full mb-2"></div>
                    <div className="h-2 bg-white/30 rounded mb-1"></div>
                    <div className="h-2 bg-white/30 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-xl">🏠</span>
              </div>
              <div>
                <div className="font-semibold">500+ Kos Premium</div>
                <div className="text-sm text-white/70">Di berbagai lokasi strategis</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <div className="font-semibold">Booking Instan</div>
                <div className="text-sm text-white/70">Proses cepat & mudah</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-xl">🔒</span>
              </div>
              <div>
                <div className="font-semibold">Aman & Terpercaya</div>
                <div className="text-sm text-white/70">Data terenkripsi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">KH</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KostHunt</h1>
              <p className="text-sm text-gray-500">Cari kos impianmu</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Gratis 🎉</h1>
              <p className="text-gray-600">Isi data anda untuk membuat akun baru.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 px-4 border-2 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 px-4 border-2 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">No. Telepon</label>
                <Input
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 px-4 border-2 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 px-4 border-2 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                disabled={mutation.status === 'pending'}
              >
                {mutation.status === 'pending' ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Mendaftarkan...
                  </span>
                ) : (
                  "Daftar Sekarang"
                )}
              </Button>
            </form>

            {mutation.status === 'error' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ {(mutation.error as Error)?.message || "Terjadi kesalahan saat mendaftar."}
                </p>
              </div>
            )}

            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Sudah punya akun?</span>
                </div>
              </div>

              <Link href="/auth/login" className="block">
                <Button variant="outline" className="w-full h-12 border-2 hover:border-emerald-500 hover:bg-emerald-50 transition-colors font-semibold">
                  Masuk Sekarang
                </Button>
              </Link>
            </div>
          </div>

          {/* Privacy note */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Dengan mendaftar, Anda menyetujui</p>
            <p className="font-medium text-gray-700">
              Syarat & Ketentuan dan Kebijakan Privasi kami
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
