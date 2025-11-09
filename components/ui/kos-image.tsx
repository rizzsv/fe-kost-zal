"use client"

import * as React from "react"
import { fetchKosImages, getKosImageUrl } from "@/lib/api/kos-api"

interface KosImageProps {
  kosId: number
  alt: string
  className?: string
}

export default function KosImage({ kosId, alt, className }: KosImageProps) {
  const [imageSrc, setImageSrc] = React.useState<string>("https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Loading...")
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true)
        setError(false)
        
        console.log(`🖼️ Loading image for kos ${kosId}`)
        
        // Fetch images using API function
        const images = await fetchKosImages(kosId)
        
        if (images && images.length > 0) {
          // Use the first image
          const imageUrl = getKosImageUrl(images[0])
          console.log(`✅ Using image URL for kos ${kosId}:`, imageUrl)
          setImageSrc(imageUrl)
        } else {
          console.log(`⚠️ No images found for kos ${kosId}`)
          setImageSrc("https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=No+Image")
          setError(true)
        }
      } catch (err) {
        console.error(`❌ Error loading image for kos ${kosId}:`, err)
        setImageSrc("https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Image+Error")
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [kosId])

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={isLoading ? { opacity: 0.5 } : {}}
      onError={(e) => {
        console.log(`⚠️ Image failed to load for kos ${kosId}, using placeholder`)
        const target = e.target as HTMLImageElement
        target.src = "https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=No+Image"
      }}
    />
  )
}
