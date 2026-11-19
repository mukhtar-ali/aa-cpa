import { apiClient } from '@/lib/api-client'
import { endpoint, type ServiceAdmin, type ServiceForm } from '@repo/shared'

export const servicesApi = {
  list: async (): Promise<ServiceAdmin[]> => {
    const res = await apiClient.get(endpoint.adminServices.list)
    return Array.isArray(res.data) ? res.data : (res.data?.items ?? [])
  },
  getById: async (id: string): Promise<ServiceAdmin> => {
    const res = await apiClient.get(endpoint.adminServices.getById(id))
    return res.data
  },
  create: async (data: ServiceForm): Promise<ServiceAdmin> => {
    const res = await apiClient.post(endpoint.adminServices.create, data)
    return res.data
  },
  update: async (id: string, data: ServiceForm): Promise<ServiceAdmin> => {
    const res = await apiClient.put(endpoint.adminServices.update(id), data)
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(endpoint.adminServices.delete(id))
  },
  reorder: async (ids: string[]): Promise<void> => {
    await apiClient.patch(endpoint.adminServices.reorder, { ids })
  },
  publish: async (id: string, isPublished: boolean): Promise<void> => {
    await apiClient.patch(endpoint.adminServices.publish(id), { isPublished })
  },
  requestPreviewUrl: async (slug: string): Promise<{ url: string; token: string }> => {
    const res = await apiClient.post(endpoint.preview.token, {
      kind: 'service',
      key: slug,
    })
    return res.data
  },
}
