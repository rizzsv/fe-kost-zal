"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"

const API_URL = "https://learn.smktelkom-mlg.sch.id/kos/api/login"

async function loginSociety(payload: { email: string; password: string }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      makerID: "1",
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  
  if (!res.ok) {
    // try to parse as JSON for structured errors
    try {
      const errorData = JSON.parse(text)
      throw errorData
    } catch {
      // if not JSON, throw the text as error message
      throw new Error(text || "Login failed")
    }
  }

  // parse successful response
  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Invalid response format")
  }
}

export default function SocietyLoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => loginSociety(data),
    onSuccess: (data) => {
      // Debug: log response structure
      console.log("Login response:", data)
      
      // Store token - try different possible structures
      const token = data.token || data.data?.token || data.access_token
      const user = data.user || data.data?.user || data.data

      // If backend provides a role, make sure it matches 'society' for this form.
      const responseRole = user?.role || data.role || data.data?.role
      if (responseRole && responseRole !== "society") {
        // Show mismatch page instead of direct redirect
        const actual = encodeURIComponent(responseRole)
        const expected = "society"
        alert("Akun yang masuk bukan akun Pengguna. Anda akan diarahkan ke halaman penjelasan.")
        console.warn("Blocked cross-role login attempt:", { responseRole, data })
        router.push(`/role-mismatch?expected=${expected}&actual=${actual}`)
        return
      }

      if (token) {
        localStorage.setItem("token", token)
        localStorage.setItem("authToken", token)
        console.log("Token saved:", token)
      } else {
        console.error("No token found in response:", data)
      }

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user))
        localStorage.setItem("userRole", "society")
        console.log("User saved:", user)
      }

      router.push("/dashboard")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Left illustration */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="max-w-md text-white z-10 space-y-6 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Platform #1 Pencarian Kos</span>
            </div>
            
            <h2 className="text-5xl font-bold leading-tight">
              Selamat Datang Kembali! 👋
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Masuk untuk mengelola pemesanan dan menyewa kos dengan mudah dan aman.
            </p>
          </div>

          {/* Animated illustration */}
          <div className="relative w-full h-80 animate-float">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
              {/* Building illustration */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-24 h-32 bg-white/20 rounded-lg backdrop-blur animate-slide-up delay-100"></div>
                  <div className="w-20 h-28 bg-white/20 rounded-lg backdrop-blur animate-slide-up delay-200"></div>
                  <div className="w-28 h-36 bg-white/20 rounded-lg backdrop-blur animate-slide-up delay-300"></div>
                </div>
                <div className="flex gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-white/20 rounded backdrop-blur animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                  ))}
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-400/30 rounded-full animate-bounce"></div>
              <div className="absolute bottom-8 left-6 w-8 h-8 bg-pink-400/30 rounded-full animate-bounce delay-500"></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-white/70">Kos Tersedia</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1K+</div>
              <div className="text-sm text-white/70">Pengguna</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">4.8★</div>
              <div className="text-sm text-white/70">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">KH</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KostHunt</h1>
              <p className="text-sm text-gray-500">Cari kos impianmu</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Masuk 🚀</h1>
              <p className="text-gray-600">Masuk menggunakan email dan password Anda.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 px-4 border-2 focus:border-cyan-500 transition-colors"
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
                  className="h-12 px-4 border-2 focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                disabled={mutation.status === 'pending'}
              >
                {mutation.status === 'pending' ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses...
                  </span>
                ) : (
                  "Masuk Sekarang"
                )}
              </Button>
            </form>

            {mutation.status === 'error' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ {(mutation.error as Error)?.message || "Login gagal. Periksa email dan password Anda."}
                </p>
              </div>
            )}

            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Belum punya akun?</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <Link href="/auth/register" className="block">
                  <Button variant="outline" className="w-full h-12 border-2 hover:border-cyan-500 hover:bg-cyan-50 transition-colors font-semibold">
                    Daftar Sekarang
                  </Button>
                </Link>
                <Link href="/owner/login" className="text-sm text-gray-600 hover:text-cyan-600 transition-colors inline-flex items-center gap-1">
                  <span>Masuk sebagai Owner</span>
                  <span className="text-lg">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>Aman</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>Cepat</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-1">
              <span>✨</span>
              <span>Terpercaya</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
