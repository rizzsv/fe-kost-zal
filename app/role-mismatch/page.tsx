import React from "react"
import Link from "next/link"

type Props = {
  searchParams?: {
    expected?: string
    actual?: string
  }
}

export default function RoleMismatchPage({ searchParams }: Props) {
  const expected = (searchParams?.expected || "owner").toLowerCase()
  const actual = (searchParams?.actual || "society").toLowerCase()

  const title = "Server Not Found"
  const subtitle = `Sepertinya Anda mencoba mengakses area untuk \"${expected}\".`
  const message = `Akun Anda terdaftar sebagai \"${actual}\" bukan \"${expected}\".`

  const loginHref = expected === "owner" ? "/owner/login" : "/auth/login"

  return (
    <div className="min-h-screen bg-white flex items-center">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold text-cyan-700">{title}</h1>
            <p className="text-lg text-gray-600">{subtitle}</p>
            <p className="text-sm text-gray-500">{message}</p>

            <div className="flex items-center gap-3">
              <Link href={loginHref} className="inline-block bg-cyan-600 text-white px-5 py-3 rounded-md font-medium hover:bg-cyan-700">
                Pergi ke Halaman Login {expected === "owner" ? "Owner" : "Pengguna"}
              </Link>

              <Link href="/" className="inline-block border border-gray-200 px-5 py-3 rounded-md text-gray-700 hover:bg-gray-50">
                Kembali ke Beranda
              </Link>
            </div>

            <div className="mt-8 text-sm text-gray-400">
              <p>Jika Anda yakin ini salah, coba login lewat halaman yang sesuai atau hubungi admin.</p>
            </div>
          </div>

          {/* Right side - big 404 + robot illustration (simple SVG) */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="text-right">
                <div className="text-7xl font-extrabold text-yellow-400">404</div>
                <div className="mt-2 text-xl font-semibold text-gray-700">{title}</div>
              </div>

              <svg viewBox="0 0 200 120" className="w-full mt-6" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0" stopColor="#60a5fa" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="200" height="120" rx="8" fill="#f8fafc" />
                {/* simple robot */}
                <g transform="translate(30,18)">
                  <rect x="90" y="10" width="60" height="60" rx="12" fill="url(#g)" opacity="0.95" />
                  <circle cx="120" cy="40" r="8" fill="#fff" />
                  <rect x="100" y="70" width="20" height="8" rx="2" fill="#94a3b8" />
                  <path d="M10 70 q20 -30 40 0" stroke="#cbd5e1" strokeWidth="3" fill="none" />
                </g>
              </svg>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
