import {
  endpoint,
  type ServiceAdmin,
  type ServiceForm,
} from '@repo/shared'
import { api } from './api'

export interface ServicesAdminListResponse {
  items: ServiceAdmin[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getAdminServices(params?: { page?: number; limit?: number; q?: string; isPublished?: boolean }) {
  const res = await api.get<ServicesAdminListResponse>(endpoint.adminServices.list, { params })
  return res.data
}

export async function getAdminServiceById(id: string) {
  const res = await api.get<ServiceAdmin>(endpoint.adminServices.getById(id))
  return res.data
}

export async function createAdminService(data: ServiceForm) {
  const res = await api.post<{ service: ServiceAdmin }>(endpoint.adminServices.create, data)
  return res.data.service
}

export async function updateAdminService(id: string, data: ServiceForm) {
  const res = await api.put<{ service: ServiceAdmin }>(endpoint.adminServices.update(id), data)
  return res.data.service
}

export async function deleteAdminService(id: string) {
  const res = await api.delete(endpoint.adminServices.delete(id))
  return res.data
}

export async function publishAdminService(id: string, isPublished: boolean) {
  const res = await api.put<{ service: ServiceAdmin }>(endpoint.adminServices.publish(id), { isPublished })
  return res.data.service
}

export async function reorderAdminServices(items: Array<{ id: string; order: number }>) {
  const res = await api.put(endpoint.adminServices.reorder, { items })
  return res.data
}

export async function issuePreviewToken(kind: 'page' | 'service' | 'sector' | 'article' | 'job', key: string) {
  const res = await api.post<{ token: string; url: string; expiresAt: string }>(endpoint.preview.token, { kind, key })
  return res.data
}
