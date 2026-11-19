import { endpoint } from '@repo/shared'
import { api } from './api'

interface UploadResponse {
    data: string
}

export async function uploadImage(file: File, onProgress?: (percent: number) => void) {
    const formData = new FormData()
    formData.append('image', file)

    const res = await api.post<UploadResponse>(endpoint.upload.image, formData, {
        onUploadProgress: (event) => {
            if (!onProgress || !event.total) return
            onProgress(Math.round((event.loaded / event.total) * 100))
        },
    })
    return res.data.data
}
