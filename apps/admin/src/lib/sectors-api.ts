import {
  endpoint,
  type SectorAdmin,
  type SectorForm,
} from '@repo/shared'
import { api } from './api'

export interface SectorsAdminListResponse {
  items: SectorAdmin[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getAdminSectors(params?: { page?: number; limit?: number; q?: string; isPublished?: boolean }) {
  const res = await api.get<SectorsAdminListResponse>(endpoint.adminSectors.list, { params })
  return res.data
}

export async function getAdminSectorById(id: string) {
  const res = await api.get<SectorAdmin>(endpoint.adminSectors.getById(id))
  return res.data
}

export async function createAdminSector(data: SectorForm) {
  const res = await api.post<{ sector: SectorAdmin }>(endpoint.adminSectors.create, data)
  return res.data.sector
}

export async function updateAdminSector(id: string, data: SectorForm) {
  const res = await api.put<{ sector: SectorAdmin }>(endpoint.adminSectors.update(id), data)
  return res.data.sector
}

export async function deleteAdminSector(id: string) {
  const res = await api.delete(endpoint.adminSectors.delete(id))
  return res.data
}

export async function publishAdminSector(id: string, isPublished: boolean) {
  const res = await api.put<{ sector: SectorAdmin }>(endpoint.adminSectors.publish(id), { isPublished })
  return res.data.sector
}

export async function reorderAdminSectors(items: Array<{ id: string; order: number }>) {
  const res = await api.put(endpoint.adminSectors.reorder, { items })
  return res.data
}
