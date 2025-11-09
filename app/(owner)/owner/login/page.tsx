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

async function loginOwner(payload: { email: string; password: string }) {
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

export default function OwnerLoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => loginOwner(data),
    onSuccess: (data) => {
      console.log("Owner login response:", data)
      
      // Handle multiple possible token locations in response
      const token = data.token || data.data?.token || data.access_token
      const user = data.user || data.data?.user || data.data

      // If backend provides a role, make sure it matches 'owner' for this form.
      const responseRole = user?.role || data.role || data.data?.role
      if (responseRole && responseRole !== "owner") {
        // Do not log in this user from the owner form — show role-mismatch page
        const actual = encodeURIComponent(responseRole)
        const expected = "owner"
        alert("Akun yang masuk bukan akun Owner. Anda akan diarahkan ke halaman penjelasan.")
        console.warn("Blocked cross-role login attempt:", { responseRole, data })
        router.push(`/role-mismatch?expected=${expected}&actual=${actual}`)
        return
      }

      if (token) {
        localStorage.setItem("token", token)
        localStorage.setItem("authToken", token) // Also save as authToken for consistency
        console.log("Token saved:", token)
      }

      // IMPORTANT: Save userRole for AuthGuard
      localStorage.setItem("userRole", "owner")
      console.log("User role saved: owner")

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user))
        console.log("User saved:", user)
      }

      router.push("/owner/dashboard")
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Left illustration (owner orange theme) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="max-w-md text-white z-10 space-y-6 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Owner Dashboard</span>
            </div>
            
            <h2 className="text-5xl font-bold leading-tight">
              Selamat Datang, Owner! 🏢
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Kelola properti kos Anda dengan mudah. Pantau booking, fasilitas, dan pendapatan dalam satu platform.
            </p>
          </div>

          {/* Animated illustration - Dashboard */}
          <div className="relative w-full h-80 animate-float">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-2xl">
              {/* Dashboard cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 animate-slide-up delay-100">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-sm font-semibold">Total Kos</div>
                  <div className="text-2xl font-bold">24</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 animate-slide-up delay-200">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-sm font-semibold">Pendapatan</div>
                  <div className="text-2xl font-bold">45M</div>
                </div>
              </div>

              {/* Chart visualization */}
              <div className="bg-white/20 backdrop-blur rounded-xl p-4 animate-slide-up delay-300">
                <div className="flex items-end justify-between h-32 gap-2">
                  {[40, 60, 45, 80, 55, 90, 70].map((height, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-amber-400/50 rounded-t animate-grow"
                      style={{ 
                        height: `${height}%`,
                        animationDelay: `${i * 100}ms`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Floating notification */}
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <span className="text-white font-bold text-xl">5</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/70">Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-white/70">Secure</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">Fast</div>
              <div className="text-sm text-white/70">Update</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">KH</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KostHunt Owner</h1>
              <p className="text-sm text-gray-500">Kelola kos Anda</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span>👔</span>
                <span>Owner Portal</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Masuk Dashboard 🎯</h1>
              <p className="text-gray-600">Masuk untuk mengelola properti kos Anda.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  placeholder="owner@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 px-4 border-2 focus:border-orange-500 transition-colors"
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
                  className="h-12 px-4 border-2 focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                disabled={mutation.status === 'pending'}
              >
                {mutation.status === 'pending' ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses...
                  </span>
                ) : (
                  "Masuk ke Dashboard"
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
                <Link href="/owner/register" className="block">
                  <Button variant="outline" className="w-full h-12 border-2 hover:border-orange-500 hover:bg-orange-50 transition-colors font-semibold">
                    Daftar Sebagai Owner
                  </Button>
                </Link>
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-orange-600 transition-colors inline-flex items-center gap-1">
                  <span>Masuk sebagai Pengguna</span>
                  <span className="text-lg">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Owner benefits */}
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
            <div className="text-sm font-semibold text-orange-900 mb-3">Keuntungan Jadi Owner:</div>
            <div className="space-y-2 text-sm text-orange-800">
              <div className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                <span>Kelola multiple properti</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                <span>Dashboard analytics lengkap</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500">✓</span>
                <span>Notifikasi booking real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
