/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Mengizinkan semua domain HTTPS
      },
      {
        protocol: 'http',
        hostname: '**', // Mengizinkan semua domain HTTP (untuk development)
      },
    ],
  },
}

export default nextConfig