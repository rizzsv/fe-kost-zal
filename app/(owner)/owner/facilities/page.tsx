"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { addFacility, updateFacility, deleteFacility, getFacilitiesByKos } from "@/lib/api/facility-api"
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Home as HomeIcon, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { OwnerGuard } from "@/components/auth-guard"

interface KosItem {
  id: number
  name: string
  address: string
  type?: string
}

interface FacilityItem {
  id: number
  facility_name: string
  kos_id: number
}

// Fetch kos list from API
async function fetchKosList() {
  const token = localStorage.getItem("token")
  const url = "https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_kos"
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "MakerID": "1",
      "Authorization": `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch kos list")
  }

  const data = await res.json()
  return data.data || data || []
}

export default function FacilityManagementPage() {
  const [selectedKosId, setSelectedKosId] = useState<number | null>(null)
  const [newFacilityName, setNewFacilityName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  
  const queryClient = useQueryClient()

  // Fetch kos list
  const { data: kosList, isLoading: kosLoading } = useQuery({
    queryKey: ["kosList"],
    queryFn: fetchKosList,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  })

  // Auto-select first kos when loaded
  useEffect(() => {
    if (kosList && kosList.length > 0 && !selectedKosId) {
      setSelectedKosId(kosList[0].id)
    }
  }, [kosList, selectedKosId])

  // Fetch facilities for selected kos
  const { data: facilities, isLoading: facilitiesLoading, refetch: refetchFacilities } = useQuery({
    queryKey: ["facilities", selectedKosId],
    queryFn: () => getFacilitiesByKos(selectedKosId!),
    enabled: !!selectedKosId,
    retry: false, // Don't retry on 404
  })

  // Use empty array as fallback
  const facilityList = facilities || []

  const selectedKos = kosList?.find((k: KosItem) => k.id === selectedKosId)

  // Add facility mutation
  const addMutation = useMutation({
    mutationFn: ({ kosId, name }: { kosId: number; name: string }) => 
      addFacility(kosId, name),
    onSuccess: () => {
      alert("✅ Fasilitas berhasil ditambahkan!")
      setNewFacilityName("")
      
      // Refetch facilities after adding
      if (selectedKosId) {
        queryClient.invalidateQueries({ queryKey: ["facilities", selectedKosId] })
        refetchFacilities()
      }
    },
    onError: (error: Error) => {
      console.error("Error adding facility:", error)
      alert(`❌ Gagal menambahkan fasilitas: ${error.message}`)
    }
  })

  // Update facility mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => 
      updateFacility(id, name),
    onSuccess: () => {
      alert("✅ Fasilitas berhasil diupdate!")
      
      if (selectedKosId) {
        queryClient.invalidateQueries({ queryKey: ["facilities", selectedKosId] })
        refetchFacilities()
      }
      
      setEditingId(null)
      setEditingName("")
    },
    onError: (error: Error) => {
      console.error("Error updating facility:", error)
      alert(`❌ Gagal mengupdate fasilitas: ${error.message}`)
    }
  })

  // Delete facility mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFacility(id),
    onSuccess: () => {
      alert("✅ Fasilitas berhasil dihapus!")
      if (selectedKosId) {
        queryClient.invalidateQueries({ queryKey: ["facilities", selectedKosId] })
        refetchFacilities()
      }
    },
    onError: (error: Error) => {
      console.error("Error deleting facility:", error)
      alert(`❌ Gagal menghapus fasilitas: ${error.message}`)
    }
  })

  const handleAddFacility = () => {
    if (!selectedKosId) {
      alert("Pilih kos terlebih dahulu!")
      return
    }
    if (!newFacilityName.trim()) {
      alert("Nama fasilitas tidak boleh kosong!")
      return
    }
    addMutation.mutate({ kosId: selectedKosId, name: newFacilityName.trim() })
  }

  const handleUpdateFacility = (id: number) => {
    if (!editingName.trim()) {
      alert("Nama fasilitas tidak boleh kosong!")
      return
    }
    updateMutation.mutate({ id, name: editingName.trim() })
  }

  const handleDeleteFacility = (id: number, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus fasilitas "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  const startEditing = (facility: FacilityItem) => {
    setEditingId(facility.id)
    setEditingName(facility.facility_name)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName("")
  }

  if (kosLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        <span className="ml-3 text-gray-600">Memuat data kos...</span>
      </div>
    )
  }

  if (!kosList || kosList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/owner/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <HomeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Kos</h2>
          <p className="text-gray-600 mb-6">Silakan tambah kos terlebih dahulu di dashboard</p>
          <Link href="/owner/dashboard">
            <Button>Ke Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <OwnerGuard>
      <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/owner/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Fasilitas</h1>
              <p className="text-sm text-gray-600">Kelola fasilitas untuk setiap kos Anda</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Kos Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HomeIcon className="w-5 h-5" />
              Pilih Kos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {kosList.map((kos: KosItem) => (
                <button
                  key={kos.id}
                  onClick={() => setSelectedKosId(kos.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedKosId === kos.id
                      ? "bg-orange-500 text-white border-orange-500 shadow-lg"
                      : "bg-white border-gray-200 hover:border-orange-300 hover:shadow"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-lg mb-1">{kos.name}</p>
                      <p className={`text-sm ${selectedKosId === kos.id ? "text-white/80" : "text-gray-600"}`}>
                        {kos.address}
                      </p>
                      {kos.type && (
                        <Badge 
                          variant="secondary" 
                          className={`mt-2 ${selectedKosId === kos.id ? "bg-white/20 text-white" : ""}`}
                        >
                          {kos.type}
                        </Badge>
                      )}
                    </div>
                    {selectedKosId === kos.id && (
                      <CheckCircle className="w-6 h-6 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Facilities Management */}
        {selectedKos && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Facility */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Tambah Fasilitas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nama Fasilitas
                  </label>
                  <Input
                    placeholder="Contoh: WiFi, AC, TV, Parkir..."
                    value={newFacilityName}
                    onChange={(e) => setNewFacilityName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddFacility()
                    }}
                    disabled={addMutation.status === 'pending'}
                  />
                </div>
                <Button 
                  onClick={handleAddFacility}
                  disabled={addMutation.status === 'pending' || !newFacilityName.trim()}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {addMutation.status === 'pending' ? 'Menambahkan...' : 'Tambah Fasilitas'}
                </Button>
                
                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="font-medium mb-1">💡 Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Tekan Enter untuk cepat menambah</li>
                    <li>Fasilitas tersimpan per kos</li>
                    <li>Dapat diedit dan dihapus kapan saja</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Facility List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fasilitas "{selectedKos.name}"</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{selectedKos.address}</p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {facilityList?.length || 0} Fasilitas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {facilitiesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                    <span className="ml-3 text-gray-600">Memuat fasilitas...</span>
                  </div>
                ) : !facilityList || facilityList.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">Belum ada fasilitas</p>
                    <p className="text-sm text-gray-400">Tambahkan fasilitas pertama untuk kos ini</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {facilityList.map((facility: FacilityItem) => (
                      <div
                        key={facility.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        {editingId === facility.id ? (
                          <>
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 mr-2"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateFacility(facility.id)
                                if (e.key === 'Escape') cancelEditing()
                              }}
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateFacility(facility.id)}
                                disabled={updateMutation.status === 'pending'}
                              >
                                <Save className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditing}
                                disabled={updateMutation.status === 'pending'}
                              >
                                <X className="w-4 h-4 text-gray-600" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="font-medium text-gray-900 flex-1">
                              ✓ {facility.facility_name}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditing(facility)}
                                disabled={deleteMutation.status === 'pending'}
                              >
                                <Edit2 className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteFacility(facility.id, facility.facility_name)}
                                disabled={deleteMutation.status === 'pending'}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
    </OwnerGuard>
  )
}
