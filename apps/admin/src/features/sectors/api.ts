import { apiClient } from '@/lib/api-client'
import { endpoint, type SectorAdmin, type SectorForm } from '@repo/shared'

export const sectorsApi = {
  list: async (): Promise<SectorAdmin[]> => {
    const res = await apiClient.get(endpoint.adminSectors.list)
    return Array.isArray(res.data) ? res.data : (res.data?.items ?? [])
  },
  create: async (data: SectorForm): Promise<SectorAdmin> => {
    const res = await apiClient.post(endpoint.adminSectors.create, data)
    return res.data
  },
  update: async (id: string, data: SectorForm): Promise<SectorAdmin> => {
    const res = await apiClient.put(endpoint.adminSectors.update(id), data)
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(endpoint.adminSectors.delete(id))
  },
  reorder: async (ids: string[]): Promise<void> => {
    await apiClient.patch(endpoint.adminSectors.reorder, { ids })
  },
  publish: async (id: string, isPublished: boolean): Promise<void> => {
    await apiClient.patch(endpoint.adminSectors.publish(id), { isPublished })
  },
}
