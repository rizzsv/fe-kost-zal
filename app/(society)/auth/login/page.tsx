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
      
      if (token) {
        localStorage.setItem("token", token)
        console.log("Token saved:", token)
      } else {
        console.error("No token found in response:", data)
      }
      
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user))
        console.log("User saved:", user)
      }
      
      router.push("/")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
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
            <Button type="submit" className="w-full" disabled={mutation.status === 'pending'}>
              {mutation.status === 'pending' ? "Login..." : "Login"}
            </Button>
          </form>

          {mutation.status === 'error' && (
            <p className="text-sm text-red-600 mt-3">{(mutation.error as Error)?.message || "Login gagal"}</p>
          )}

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
