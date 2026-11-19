import {
  endpoint,
  type ContactAdmin,
  type ContactQueryModel,
} from '@repo/shared'
import { api } from './api'

export interface LeadsAdminListResponse {
  items: ContactAdmin[]
  totalCount?: number
  totalPages?: number
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getAdminLeads(params?: ContactQueryModel & { source?: string; status?: string; q?: string }) {
  const res = await api.get<LeadsAdminListResponse>(endpoint.adminLeads.list, { params })
  return res.data
}

export async function getAdminLeadById(id: string) {
  const res = await api.get<ContactAdmin>(endpoint.adminLeads.getById(id))
  return res.data
}

export async function updateAdminLead(id: string, data: { status?: string; assignedToId?: string | null; notes?: string }) {
  const res = await api.put<ContactAdmin>(endpoint.adminLeads.update(id), data)
  return res.data
}

export async function addAdminLeadNote(id: string, body: string) {
  const res = await api.post<ContactAdmin>(endpoint.adminLeads.addNote(id), { body })
  return res.data
}

export async function exportAdminLeadsCsv() {
  const res = await api.get<Blob>(endpoint.adminLeads.exportCsv, { responseType: 'blob' })
  return res.data
}

export async function exportPdplData(email: string) {
  const res = await api.post(endpoint.adminPrivacy.export, { email })
  return res.data
}

export async function erasePdplData(email: string, reason?: string) {
  const res = await api.post(endpoint.adminPrivacy.erase, { email, reason })
  return res.data
}

export async function getAdminOutbox(status?: string) {
  const res = await api.get(endpoint.adminOutbox.list, { params: status ? { status } : undefined })
  return res.data
}

export async function retryAdminOutbox(id: string) {
  const res = await api.post(endpoint.adminOutbox.retry(id))
  return res.data
}
