"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Upload, RefreshCw, Trash2, Image as ImageIcon } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadKosImage, updateKosImage, deleteKosImage } from "@/lib/api/image-api"
import { getKosImageUrl } from "@/lib/api/kos-api"

type KosImage = {
  id: number
  kos_id: number
  file: string
  created_at: string
  updated_at: string
}

type Props = {
  kos: {
    id: number
    name: string
    kos_image?: KosImage[]
  }
  onClose: () => void
  onSuccess: () => void
}

export default function ManageKosImagesModal({ kos, onClose, onSuccess }: Props) {
  const queryClient = useQueryClient()
  const [uploadingFile, setUploadingFile] = React.useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = React.useState<string | null>(null)
  const [updatingImageId, setUpdatingImageId] = React.useState<number | null>(null)
  const [updateFile, setUpdateFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const updateFileInputRef = React.useRef<HTMLInputElement>(null)

  const images = kos.kos_image || []

  // Upload new image mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadKosImage(kos.id, file),
    onSuccess: () => {
      alert("✅ Gambar berhasil ditambahkan!")
      setUploadingFile(null)
      setUploadPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      onSuccess()
      queryClient.invalidateQueries({ queryKey: ["kostList"] })
    },
    onError: (error: Error) => {
      alert("❌ " + (error.message || "Gagal mengupload gambar"))
    }
  })

  // Update existing image mutation
  const updateMutation = useMutation({
    mutationFn: ({ imageId, file }: { imageId: number; file: File }) => 
      updateKosImage(imageId, file),
    onSuccess: () => {
      alert("✅ Gambar berhasil diupdate!")
      setUpdatingImageId(null)
      setUpdateFile(null)
      if (updateFileInputRef.current) updateFileInputRef.current.value = ""
      onSuccess()
      queryClient.invalidateQueries({ queryKey: ["kostList"] })
    },
    onError: (error: Error) => {
      alert("❌ " + (error.message || "Gagal mengupdate gambar"))
    }
  })

  // Delete image mutation
  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => deleteKosImage(imageId),
    onSuccess: () => {
      alert("✅ Gambar berhasil dihapus!")
      onSuccess()
      queryClient.invalidateQueries({ queryKey: ["kostList"] })
    },
    onError: (error: Error) => {
      alert("❌ " + (error.message || "Gagal menghapus gambar"))
    }
  })

  // Handle file selection for upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("File harus berupa gambar!")
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Ukuran file maksimal 5MB!")
        return
      }
      setUploadingFile(file)
      const preview = URL.createObjectURL(file)
      setUploadPreview(preview)
    }
  }

  // Handle file selection for update
  const handleUpdateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("File harus berupa gambar!")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB!")
        return
      }
      setUpdateFile(file)
    }
  }

  // Handle upload
  const handleUpload = () => {
    if (!uploadingFile) {
      alert("Pilih gambar terlebih dahulu!")
      return
    }
    uploadMutation.mutate(uploadingFile)
  }

  // Handle update
  const handleUpdate = (imageId: number) => {
    if (!updateFile) {
      alert("Pilih gambar baru terlebih dahulu!")
      return
    }
    updateMutation.mutate({ imageId, file: updateFile })
  }

  // Handle delete
  const handleDelete = (imageId: number, fileName: string) => {
    if (window.confirm(`Hapus gambar "${fileName}"?`)) {
      deleteMutation.mutate(imageId)
    }
  }

  // Cleanup preview URL
  React.useEffect(() => {
    return () => {
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview)
      }
    }
  }, [uploadPreview])

  const isLoading = uploadMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              <ImageIcon className="w-6 h-6 inline mr-2" />
              Kelola Gambar - {kos.name}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Upload New Image Section */}
          <div className="mb-8 pb-6 border-b">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-600" />
              Upload Gambar Baru
            </h3>
            <div className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, JPEG. Maksimal 5MB</p>
              </div>
              
              {uploadPreview && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={!uploadingFile || isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Gambar
                    </>
                  )}
                </Button>
                {uploadingFile && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadingFile(null)
                      setUploadPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Existing Images Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Gambar Saat Ini ({images.length})
            </h3>
            
            {images.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada gambar</p>
                <p className="text-sm text-gray-400 mt-1">Upload gambar pertama untuk kos ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => {
                  // Construct image URL directly
                  const imageUrl = image.file.startsWith('http') 
                    ? image.file 
                    : `https://learn.smktelkom-mlg.sch.id/kos/${image.file.startsWith('/') ? image.file.slice(1) : image.file}`
                  const isUpdating = updatingImageId === image.id
                  
                  return (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="relative aspect-video bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={`${kos.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('❌ Image failed:', imageUrl)
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E"
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-xs text-gray-500 mb-2 truncate" title={image.file}>
                          {image.file.split('/').pop()}
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                          Upload: {new Date(image.created_at).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                        
                        {isUpdating ? (
                          <div className="space-y-2">
                            <input
                              ref={updateFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleUpdateFileSelect}
                              className="block w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              disabled={isLoading}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdate(image.id)}
                                disabled={!updateFile || isLoading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-8"
                              >
                                {updateMutation.isPending ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Update"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setUpdatingImageId(null)
                                  setUpdateFile(null)
                                  if (updateFileInputRef.current) updateFileInputRef.current.value = ""
                                }}
                                disabled={isLoading}
                                className="text-xs h-8"
                              >
                                Batal
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setUpdatingImageId(image.id)}
                              disabled={isLoading}
                              className="flex-1 text-xs h-8"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Ganti
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(image.id, image.file)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8"
                            >
                              {deleteMutation.isPending ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
