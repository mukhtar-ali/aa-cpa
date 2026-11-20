import { api } from '@/lib/api'
import { endpoint, type ServiceAdmin, type ServiceForm } from '@repo/shared'

export const servicesApi = {
  list: async (): Promise<ServiceAdmin[]> => {
    const res = await api.get<any>(endpoint.adminServices.list)
    return Array.isArray(res.data) ? res.data : (res.data?.items ?? [])
  },
  getById: async (id: string): Promise<ServiceAdmin> => {
    const res = await api.get<any>(endpoint.adminServices.getById(id))
    return (res.data as any)?.service ?? res.data
  },
  create: async (data: ServiceForm): Promise<ServiceAdmin> => {
    const res = await api.post<{ service: ServiceAdmin } | ServiceAdmin>(endpoint.adminServices.create, data)
    return (res.data as any)?.service ?? res.data
  },
  update: async (id: string, data: ServiceForm): Promise<ServiceAdmin> => {
    const res = await api.put<{ service: ServiceAdmin } | ServiceAdmin>(endpoint.adminServices.update(id), data)
    return (res.data as any)?.service ?? res.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(endpoint.adminServices.delete(id))
  },
  reorder: async (ids: string[]): Promise<void> => {
    await api.patch(endpoint.adminServices.reorder, { ids })
  },
  publish: async (id: string, isPublished: boolean): Promise<void> => {
    await api.patch(endpoint.adminServices.publish(id), { isPublished })
  },
  requestPreviewUrl: async (slug: string): Promise<{ url: string; token: string }> => {
    const res = await api.post<{ url: string; token: string }>(endpoint.preview.token, {
      kind: 'service',
      key: slug,
    })
    return res.data
  },
}
