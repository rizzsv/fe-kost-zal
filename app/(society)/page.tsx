"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserNav } from "@/components/ui/user-nav"
import { Star, MapPin, Filter } from "lucide-react"
import { DUMMY_KOS } from "@/lib/dummy-data"

export default function HomePage() {
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female" | "mix">("all")
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    // Load user from localStorage
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
      } catch (err) {
        console.error("Failed to parse user data")
      }
    }
  }, [])

  const filteredKos = genderFilter === "all" ? DUMMY_KOS : DUMMY_KOS.filter((k) => k.gender === genderFilter)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            🏠 Kos Hunter
          </Link>
          <UserNav user={currentUser} />
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Cari Kos Idaman Anda</h1>
          <p className="text-lg text-blue-100">Temukan tempat tinggal yang nyaman dan terjangkau</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-700">Filter Jenis Kamar:</span>
          <div className="flex gap-2 flex-wrap">
            {(["all", "male", "female", "mix"] as const).map((type) => (
              <Button
                key={type}
                variant={genderFilter === type ? "default" : "outline"}
                onClick={() => setGenderFilter(type)}
                className="capitalize"
              >
                {type === "all" ? "Semua" : type === "male" ? "Putra" : type === "female" ? "Putri" : "Campur"}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Kos List */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKos.map((kos) => (
            <Link key={kos.id} href={`/kos/${kos.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                <img src={kos.image || "/placeholder.svg"} alt={kos.name} className="w-full h-48 object-cover" />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{kos.name}</h3>
                    <Badge className="capitalize">
                      {kos.gender === "male" ? "Putra" : kos.gender === "female" ? "Putri" : "Campur"}
                    </Badge>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {kos.location}
                  </div>
                  <div className="flex items-center mb-3">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-semibold">{kos.rating}</span>
                    <span className="text-gray-600 text-sm ml-1">({kos.reviews})</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    Rp {kos.price.toLocaleString("id-ID")}
                    <span className="text-sm text-gray-600">/bulan</span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
