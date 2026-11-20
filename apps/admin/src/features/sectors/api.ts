import { api } from '@/lib/api'
import { endpoint, type SectorAdmin, type SectorForm } from '@repo/shared'

export const sectorsApi = {
  list: async (): Promise<SectorAdmin[]> => {
    const res = await api.get<any>(endpoint.adminSectors.list)
    return Array.isArray(res.data) ? res.data : (res.data?.items ?? [])
  },
  create: async (data: SectorForm): Promise<SectorAdmin> => {
    const res = await api.post<{ sector: SectorAdmin } | SectorAdmin>(endpoint.adminSectors.create, data)
    return (res.data as any)?.sector ?? res.data
  },
  update: async (id: string, data: SectorForm): Promise<SectorAdmin> => {
    const res = await api.put<{ sector: SectorAdmin } | SectorAdmin>(endpoint.adminSectors.update(id), data)
    return (res.data as any)?.sector ?? res.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(endpoint.adminSectors.delete(id))
  },
  reorder: async (ids: string[]): Promise<void> => {
    await api.patch(endpoint.adminSectors.reorder, { ids })
  },
  publish: async (id: string, isPublished: boolean): Promise<void> => {
    await api.patch(endpoint.adminSectors.publish(id), { isPublished })
  },
}
