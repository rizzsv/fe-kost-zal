"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Search, Calendar, User, LogOut, MapPin, Filter, Loader2, Building2 } from "lucide-react"
import { fetchKosList, getKosImageUrl } from "@/lib/api/kos-api"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female" | "mix">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUser, setCurrentUser] = useState<any>({ name: "User" })

  // Load current user from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem("currentUser")
        if (userStr) {
          const user = JSON.parse(userStr)
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }
  }, [])

  // Fetch kos list from API
  const { data: kosList = [], isLoading, error } = useQuery({
    queryKey: ['kos-list', searchQuery],
    queryFn: () => fetchKosList(searchQuery),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Filter by gender
  const filteredKos = genderFilter === "all" 
    ? kosList 
    : kosList.filter((k) => k.gender === genderFilter)

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("currentUser")
    router.push("/auth/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50/30 to-blue-50/30 flex relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-float delay-500"></div>
      </div>

      {/* Sidebar with animations */}
      <div className="w-64 bg-white/80 backdrop-blur-xl shadow-2xl fixed h-screen flex flex-col border-r border-gray-200 z-50">
        {/* Logo - Creative Kos Icon */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 group cursor-pointer">
            {/* Modern Kos Logo with Building Icon */}
            <div className="relative w-12 h-12">
              {/* Background gradient circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-2xl shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"></div>
              {/* Building/Kos icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white transform group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
              </div>
              {/* Dot indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            
            <div>
              <span className="font-bold text-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent block">
                KostHunt
              </span>
              <p className="text-xs text-gray-500 mt-0.5">Temukan kos impianmu</p>
            </div>
          </div>
        </div>

        {/* Navigation with consistent animations */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          <Link href="/dashboard">
            <button className="w-full px-4 py-3 flex items-center gap-3 rounded-xl transition-all duration-300 text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-cyan-50/50 hover:text-cyan-600 group">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 group-hover:bg-cyan-100 transition-colors duration-300">
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-medium flex-1 text-left">Dashboard</span>
            </button>
          </Link>

          <Link href="/">
            <button className="w-full px-4 py-3 flex items-center gap-3 rounded-xl transition-all duration-300 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-lg shadow-cyan-500/50 group relative overflow-hidden">
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm relative z-10">
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-medium flex-1 text-left relative z-10">Cari Kos</span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse relative z-10"></div>
            </button>
          </Link>

          <Link href="/dashboard">
            <button className="w-full px-4 py-3 flex items-center gap-3 rounded-xl transition-all duration-300 text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-cyan-50/50 hover:text-cyan-600 group">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 group-hover:bg-cyan-100 transition-colors duration-300">
                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-medium flex-1 text-left">Booking Saya</span>
            </button>
          </Link>

          <Link href="/profile">
            <button className="w-full px-4 py-3 flex items-center gap-3 rounded-xl transition-all duration-300 text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-cyan-50/50 hover:text-cyan-600 group">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 group-hover:bg-cyan-100 transition-colors duration-300">
                <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-medium flex-1 text-left">Profil</span>
            </button>
          </Link>
        </nav>

        {/* User Info & Logout with animations */}
        <div className="border-t border-gray-100 p-4 bg-gradient-to-br from-gray-50 to-cyan-50/30">
          <div className="mb-4 px-2">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Logged in as
            </p>
            <p className="font-semibold text-sm text-gray-800">{currentUser.name || "User"}</p>
            <p className="text-xs text-cyan-600 font-medium mt-0.5">Pencari Kos</p>
          </div>
          
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {currentUser.name ? getInitials(currentUser.name) : "N"}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{currentUser.name || "User"}</p>
              <p className="text-xs text-gray-500">Pencari Kos</p>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 relative z-10">
        {/* Hero Section with gradient and animations */}
        <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white py-16 px-8 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 animate-fade-in">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Platform #1 Pencarian Kos</span>
            </div>
            <h1 className="text-5xl font-bold mb-3 animate-fade-in-up">
              Cari Kos Idaman Anda 🏠
            </h1>
            <p className="text-xl text-white/90 animate-fade-in-up delay-200">
              Temukan tempat tinggal yang nyaman dan terjangkau
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8 animate-fade-in-up delay-300">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-3xl font-bold">{kosList.length}+</div>
                <div className="text-sm text-white/80">Kos Tersedia</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-3xl font-bold">1K+</div>
                <div className="text-sm text-white/80">Pengguna Aktif</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-sm text-white/80">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section with glassmorphism */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-6 mb-8 animate-slide-up">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 animate-fade-in">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-800">Filter Jenis Kamar:</span>
                </div>
                <div className="flex gap-3 flex-wrap animate-fade-in delay-200">
                  {(["all", "male", "female", "mix"] as const).map((type, index) => (
                    <Button
                      key={type}
                      variant={genderFilter === type ? "default" : "outline"}
                      onClick={() => setGenderFilter(type)}
                      className={`transform hover:scale-105 transition-all duration-300 ${
                        genderFilter === type 
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/50" 
                          : "hover:bg-cyan-50 hover:border-cyan-500 hover:text-cyan-600"
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {type === "all" ? "🏘️ Semua" : type === "male" ? "👨 Putra" : type === "female" ? "👩 Putri" : "👥 Campur"}
                    </Button>
                  ))}
                </div>
                <div className="ml-auto text-sm text-gray-600 animate-fade-in delay-300">
                  <span className="font-semibold text-cyan-600">{filteredKos.length}</span> kos ditemukan
                </div>
              </div>
            </div>

            {/* Kos List with powerful animations */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-cyan-200 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <p className="text-gray-600 mt-6 text-lg font-medium animate-pulse">Memuat daftar kos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 animate-fade-in-up">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-shake">
                  <span className="text-4xl">⚠️</span>
                </div>
                <p className="text-red-600 text-xl font-bold mb-2">Gagal memuat data</p>
                <p className="text-gray-600 mb-6">{error instanceof Error ? error.message : 'Terjadi kesalahan'}</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
                >
                  Coba Lagi
                </Button>
              </div>
            ) : filteredKos.length === 0 ? (
              <div className="text-center py-20 animate-fade-in-up">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔍</span>
                </div>
                <p className="text-gray-600 text-xl font-medium mb-4">Tidak ada kos yang ditemukan</p>
                {genderFilter !== "all" && (
                  <Button 
                    variant="outline" 
                    onClick={() => setGenderFilter("all")} 
                    className="mt-4 hover:bg-cyan-50 hover:border-cyan-500 hover:text-cyan-600 transform hover:scale-105 transition-all"
                  >
                    Tampilkan Semua
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredKos.map((kos, index) => {
                  // Get first image with proper URL construction
                  let imageUrl = "/placeholder.svg"
                  
                  if (kos.kos_image && kos.kos_image.length > 0) {
                    imageUrl = getKosImageUrl(kos.kos_image[0])
                  } else if (kos.image) {
                    if (kos.image.startsWith('http')) {
                      imageUrl = kos.image
                    } else {
                      const cleanImage = kos.image.startsWith('/') ? kos.image.slice(1) : kos.image
                      imageUrl = kos.image.startsWith('storage/') 
                        ? `https://learn.smktelkom-mlg.sch.id/kos/${cleanImage}`
                        : `https://learn.smktelkom-mlg.sch.id/kos/storage/${cleanImage}`
                    }
                  }
                  
                  return (
                    <div 
                      key={kos.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Link href={`/kos/${kos.id}`}>
                        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer h-full border-2 border-transparent hover:border-cyan-500 transform hover:scale-105 hover:-translate-y-2 bg-white/80 backdrop-blur-sm group">
                          <div className="relative w-full h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                            {imageUrl !== "/placeholder.svg" ? (
                              <>
                                <img
                                  src={imageUrl} 
                                  alt={kos.name}
                                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                  onError={(e) => {
                                    const currentSrc = e.currentTarget.src
                                    if (currentSrc.includes('/storage/')) {
                                      e.currentTarget.src = currentSrc.replace('/storage/', '/')
                                    } else if (!currentSrc.includes('placeholder')) {
                                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"
                                    }
                                  }}
                                />
                                {/* Overlay gradient on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                {/* Floating badge */}
                                <div className="absolute top-3 right-3 transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
                                  <Badge className="capitalize shadow-lg backdrop-blur-sm bg-white/90 text-gray-800 border-2 border-white">
                                    {kos.gender === "male" ? "👨 Putra" : kos.gender === "female" ? "👩 Putri" : "👥 Campur"}
                                  </Badge>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                  <span className="text-6xl mb-2 block">🏠</span>
                                  <span>No Image</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-5">
                            <div className="mb-3">
                              <h3 className="font-bold text-xl line-clamp-1 text-gray-800 group-hover:text-cyan-600 transition-colors">
                                {kos.name}
                              </h3>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm mb-4 group-hover:text-gray-800 transition-colors">
                              <MapPin className="w-4 h-4 mr-2 shrink-0 text-cyan-500" />
                              <span className="line-clamp-1">{kos.address}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                  Rp {typeof kos.price_per_month === 'string' 
                                    ? parseInt(kos.price_per_month).toLocaleString("id-ID") 
                                    : kos.price_per_month.toLocaleString("id-ID")}
                                </p>
                                <p className="text-sm text-gray-500">/bulan</p>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                <span className="text-white text-lg">→</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
