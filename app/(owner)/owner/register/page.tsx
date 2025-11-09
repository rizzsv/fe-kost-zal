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

async function registerOwner(payload: { name: string; email: string; phone: string; password: string; role: string }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", makerID: "1" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Register failed")
  }
  return res.json()
}

export default function OwnerRegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" })
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: { name: string; email: string; phone: string; password: string; role: string }) =>
      registerOwner(data),
    onSuccess: () => {
      // after successful register, redirect to owner login
      router.push("/owner/login")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ ...formData, role: "owner" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Left illustration (owner orange theme) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="max-w-md text-white z-10 space-y-6 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Kelola Properti dengan Mudah</span>
            </div>
            
            <h2 className="text-5xl font-bold leading-tight">
              Jadi Owner Sekarang! 🏆
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Bergabunglah dengan ratusan owner yang sudah sukses mengelola properti kos mereka bersama kami.
            </p>
          </div>

          {/* Animated illustration - Property management */}
          <div className="relative w-full h-80 animate-float">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-2xl">
              {/* Property cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 animate-slide-up delay-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-green-400/30 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-white/30 rounded mb-1"></div>
                      <div className="h-1.5 bg-white/20 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Active</span>
                    <span className="text-lg">✓</span>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 animate-slide-up delay-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-blue-400/30 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-white/30 rounded mb-1"></div>
                      <div className="h-1.5 bg-white/20 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Active</span>
                    <span className="text-lg">✓</span>
                  </div>
                </div>
              </div>

              {/* Revenue chart */}
              <div className="bg-white/20 backdrop-blur rounded-xl p-4 animate-slide-up delay-300">
                <div className="text-sm font-semibold mb-3">Monthly Revenue</div>
                <div className="flex items-end justify-between h-20 gap-1">
                  {[30, 50, 40, 70, 55, 85, 65, 90].map((height, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-orange-400 to-yellow-300 rounded-t animate-grow"
                      style={{ 
                        height: `${height}%`,
                        animationDelay: `${i * 100}ms`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Money icon */}
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <span className="text-white text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* Owner perks */}
          <div className="space-y-3 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <div className="font-semibold">Dashboard Lengkap</div>
                <div className="text-sm text-white/70">Analytics & reporting real-time</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-xl">🔔</span>
              </div>
              <div>
                <div className="font-semibold">Notifikasi Instan</div>
                <div className="text-sm text-white/70">Update booking real-time</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span className="text-xl">💎</span>
              </div>
              <div>
                <div className="font-semibold">Free Forever</div>
                <div className="text-sm text-white/70">Tanpa biaya tersembunyi</div>
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
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">KH</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KostHunt Owner</h1>
              <p className="text-sm text-gray-500">Platform kelola kos</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span>🏆</span>
                <span>Daftar sebagai Owner</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mulai Bisnis Kos 🚀</h1>
              <p className="text-gray-600">Kelola properti kos Anda secara profesional.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <Input
                  placeholder="Nama Owner"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 px-4 border-2 focus:border-orange-500 transition-colors"
                  required
                />
              </div>

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
                <label className="text-sm font-medium text-gray-700">No. Telepon</label>
                <Input
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
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

              <Link href="/owner/login" className="block">
                <Button variant="outline" className="w-full h-12 border-2 hover:border-orange-500 hover:bg-orange-50 transition-colors font-semibold">
                  Masuk ke Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Success stats */}
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
            <div className="text-sm font-semibold text-orange-900 mb-4 text-center">Bergabunglah dengan Owner Sukses Lainnya!</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-700">200+</div>
                <div className="text-xs text-orange-600">Owner</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-700">500+</div>
                <div className="text-xs text-orange-600">Properti</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-700">98%</div>
                <div className="text-xs text-orange-600">Puas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
