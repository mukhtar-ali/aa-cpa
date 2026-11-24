import { api } from '@/lib/api'
import { unwrapEntity, unwrapList } from '@/lib/api-error'
import { endpoint, type SectorAdmin, type SectorForm } from '@repo/shared'

export const sectorsApi = {
  list: async (): Promise<SectorAdmin[]> => {
    const res = await api.get<unknown>(endpoint.adminSectors.list)
    return unwrapList<SectorAdmin>(res.data)
  },
  create: async (data: SectorForm): Promise<SectorAdmin> => {
    const res = await api.post<{ sector: SectorAdmin } | SectorAdmin>(endpoint.adminSectors.create, data)
    return unwrapEntity<SectorAdmin>(res.data, 'sector')
  },
  update: async (id: string, data: SectorForm): Promise<SectorAdmin> => {
    const res = await api.put<{ sector: SectorAdmin } | SectorAdmin>(endpoint.adminSectors.update(id), data)
    return unwrapEntity<SectorAdmin>(res.data, 'sector')
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
