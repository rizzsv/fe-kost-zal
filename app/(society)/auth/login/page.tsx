"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SocietyLoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("currentUser", JSON.stringify(formData))
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <p className="text-center text-sm mt-4">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="text-blue-600 font-semibold">
              Daftar
            </Link>
          </p>
          <p className="text-center text-sm mt-2">
            Owner?{" "}
            <Link href="/owner/login" className="text-blue-600 font-semibold">
              Login Owner
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
