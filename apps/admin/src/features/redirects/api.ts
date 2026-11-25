import { api } from '@/lib/api'
import {
    endpoint,
    type RedirectAdmin,
    type RedirectForm,
    type RedirectFilter,
    type RedirectListAdmin,
} from '@repo/shared'

export const redirectsApi = {
    list: async (params?: RedirectFilter): Promise<RedirectListAdmin> => {
        const res = await api.get<RedirectListAdmin>(endpoint.adminRedirects.list, { params })
        return res.data
    },
    getById: async (id: string): Promise<RedirectAdmin> => {
        const res = await api.get<RedirectAdmin>(endpoint.adminRedirects.getById(id))
        return res.data
    },
    create: async (data: RedirectForm): Promise<RedirectAdmin> => {
        const res = await api.post<RedirectAdmin>(endpoint.adminRedirects.create, data)
        return res.data
    },
    update: async (id: string, data: RedirectForm): Promise<RedirectAdmin> => {
        const res = await api.put<RedirectAdmin>(endpoint.adminRedirects.update(id), data)
        return res.data
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(endpoint.adminRedirects.delete(id))
    },
    importCsv: async (file: File): Promise<{ imported: number; total: number }> => {
        const formData = new FormData()
        formData.append('file', file)
        const res = await api.post<{ imported: number; total: number }>(
            endpoint.adminRedirects.import,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        )
        return res.data
    },
    exportCsv: async (): Promise<Blob> => {
        const res = await api.get(endpoint.adminRedirects.exportCsv, {
            responseType: 'blob',
        })
        return res.data as Blob
    },
}
