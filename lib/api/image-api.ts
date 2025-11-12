const BASE_URL = "https://learn.smktelkom-mlg.sch.id/kos/api/admin"

/**
 * Upload image untuk kos tertentu
 */
export async function uploadKosImage(kosId: number, imageFile: File) {
  const token = localStorage.getItem("token")
  const formData = new FormData()
  formData.append("file", imageFile)
  
  const res = await fetch(`${BASE_URL}/upload_image/${kosId}`, {
    method: "POST",
    headers: {
      "makerID": "1",
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  })
  
  const text = await res.text()
  
  if (!res.ok) {
    try {
      const errorData = JSON.parse(text)
      throw new Error(errorData.message || text || "Gagal mengupload gambar")
    } catch (e) {
      throw new Error(text || "Gagal mengupload gambar")
    }
  }
  
  try {
    return JSON.parse(text)
  } catch {
    return { success: true }
  }
}

/**
 * Update image kos (ganti gambar yang sudah ada)
 */
export async function updateKosImage(imageId: number, imageFile: File) {
  const token = localStorage.getItem("token")
  const formData = new FormData()
  formData.append("file", imageFile)
  
  const res = await fetch(`${BASE_URL}/update_image/${imageId}`, {
    method: "POST",
    headers: {
      "makerID": "1",
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  })
  
  const text = await res.text()
  
  if (!res.ok) {
    try {
      const errorData = JSON.parse(text)
      throw new Error(errorData.message || text || "Gagal mengupdate gambar")
    } catch (e) {
      throw new Error(text || "Gagal mengupdate gambar")
    }
  }
  
  try {
    return JSON.parse(text)
  } catch {
    return { success: true }
  }
}

/**
 * Delete image kos
 */
export async function deleteKosImage(imageId: number) {
  const token = localStorage.getItem("token")
  
  const res = await fetch(`${BASE_URL}/delete_image/${imageId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "makerID": "1",
      "Authorization": `Bearer ${token}`
    },
  })
  
  const text = await res.text()
  
  if (!res.ok) {
    try {
      const errorData = JSON.parse(text)
      throw new Error(errorData.message || text || "Gagal menghapus gambar")
    } catch (e) {
      throw new Error(text || "Gagal menghapus gambar")
    }
  }
  
  try {
    return JSON.parse(text)
  } catch {
    return { success: true }
  }
}
