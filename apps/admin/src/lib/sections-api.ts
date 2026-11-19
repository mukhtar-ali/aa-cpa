import { endpoint } from '@repo/shared'
import { api } from './api'

export async function getAdminSection<T = Record<string, unknown>>(type: string): Promise<T> {
  const res = await api.get<T>(endpoint.adminSections.getByType(type))
  return res.data
}

export async function updateAdminSection<T = Record<string, unknown>>(type: string, data: T) {
  const res = await api.put(endpoint.adminSections.updateByType(type), data)
  return res.data
}
