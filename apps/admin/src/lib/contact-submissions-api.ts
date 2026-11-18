import {
  endpoint,
  type ContactModel,
  type ContactQueryModel,
  type ContactStatusModel,
  type PaginatorModel,
} from '@repo/shared'
import { api } from './api'
import { toQueryParams } from './table-filters'

export type ContactSubmissionsResponse = PaginatorModel<ContactModel>

export async function getContactSubmissions(query: ContactQueryModel) {
  const res = await api.get<ContactSubmissionsResponse>(endpoint.contact.list, { params: toQueryParams(query) })
  return res.data
}

export async function getContactSubmissionsUnreadCount() {
  const res = await api.get<{ count: number }>(endpoint.contact.unreadCount)
  return res.data.count
}

export async function updateContactSubmissionStatus(id: string, data: ContactStatusModel) {
  const res = await api.put(`${endpoint.contact.updateStatus}/${id}/status`, data)
  return res.data
}

export async function deleteContactSubmission(id: string) {
  const res = await api.delete(`${endpoint.contact.delete}/${id}`)
  return res.data
}
