import {
  endpoint,
  type ArticleCategoryAdmin,
  type ArticleCategoryForm,
  type AuthorAdmin,
  type AuthorForm,
  type ClientLogoAdmin,
  type ClientLogoForm,
  type CredentialAdmin,
  type CredentialForm,
  type FaqItemAdmin,
  type FaqItemForm,
  type JobDepartmentAdmin,
  type JobDepartmentForm,
  type OfficeAdmin,
  type OfficeForm,
  type TestimonialAdmin,
  type TestimonialForm,
} from '@repo/shared'
import { api } from './api'

// ---- Article Categories ----
export async function getAdminArticleCategories() {
  const res = await api.get<ArticleCategoryAdmin[]>(endpoint.adminArticleCategories.list)
  return res.data
}

export async function createAdminArticleCategory(data: ArticleCategoryForm) {
  const res = await api.post<ArticleCategoryAdmin>(endpoint.adminArticleCategories.create, data)
  return res.data
}

export async function updateAdminArticleCategory(id: string, data: ArticleCategoryForm) {
  const res = await api.put<ArticleCategoryAdmin>(endpoint.adminArticleCategories.update(id), data)
  return res.data
}

export async function deleteAdminArticleCategory(id: string) {
  const res = await api.delete(endpoint.adminArticleCategories.delete(id))
  return res.data
}

// ---- Authors ----
export async function getAdminAuthors() {
  const res = await api.get<AuthorAdmin[]>(endpoint.adminAuthors.list)
  return res.data
}

export async function createAdminAuthor(data: AuthorForm) {
  const res = await api.post<AuthorAdmin>(endpoint.adminAuthors.create, data)
  return res.data
}

export async function updateAdminAuthor(id: string, data: AuthorForm) {
  const res = await api.put<AuthorAdmin>(endpoint.adminAuthors.update(id), data)
  return res.data
}

export async function deleteAdminAuthor(id: string) {
  const res = await api.delete(endpoint.adminAuthors.delete(id))
  return res.data
}

// ---- Job Departments ----
export async function getAdminJobDepartments() {
  const res = await api.get<JobDepartmentAdmin[]>(endpoint.adminJobDepartments.list)
  return res.data
}

export async function createAdminJobDepartment(data: JobDepartmentForm) {
  const res = await api.post<JobDepartmentAdmin>(endpoint.adminJobDepartments.create, data)
  return res.data
}

export async function updateAdminJobDepartment(id: string, data: JobDepartmentForm) {
  const res = await api.put<JobDepartmentAdmin>(endpoint.adminJobDepartments.update(id), data)
  return res.data
}

export async function deleteAdminJobDepartment(id: string) {
  const res = await api.delete(endpoint.adminJobDepartments.delete(id))
  return res.data
}

// ---- Offices ----
export async function getAdminOffices() {
  const res = await api.get<OfficeAdmin[]>(endpoint.adminOffices.list)
  return res.data
}

export async function createAdminOffice(data: OfficeForm) {
  const res = await api.post<OfficeAdmin>(endpoint.adminOffices.create, data)
  return res.data
}

export async function updateAdminOffice(id: string, data: OfficeForm) {
  const res = await api.put<OfficeAdmin>(endpoint.adminOffices.update(id), data)
  return res.data
}

export async function deleteAdminOffice(id: string) {
  const res = await api.delete(endpoint.adminOffices.delete(id))
  return res.data
}

export async function reorderAdminOffices(items: Array<{ id: string; order: number }>) {
  const res = await api.put(endpoint.adminOffices.reorder, { items })
  return res.data
}

// ---- Testimonials ----
export async function getAdminTestimonials() {
  const res = await api.get<TestimonialAdmin[]>(endpoint.adminTestimonials.list)
  return res.data
}

export async function createAdminTestimonial(data: TestimonialForm) {
  const res = await api.post<TestimonialAdmin>(endpoint.adminTestimonials.create, data)
  return res.data
}

export async function updateAdminTestimonial(id: string, data: TestimonialForm) {
  const res = await api.put<TestimonialAdmin>(endpoint.adminTestimonials.update(id), data)
  return res.data
}

export async function deleteAdminTestimonial(id: string) {
  const res = await api.delete(endpoint.adminTestimonials.delete(id))
  return res.data
}

export async function reorderAdminTestimonials(items: Array<{ id: string; order: number }>) {
  const res = await api.put(endpoint.adminTestimonials.reorder, { items })
  return res.data
}

// ---- Client Logos ----
export async function getAdminClientLogos() {
  const res = await api.get<ClientLogoAdmin[]>(endpoint.adminClientLogos.list)
  return res.data
}

export async function createAdminClientLogo(data: ClientLogoForm) {
  const res = await api.post<ClientLogoAdmin>(endpoint.adminClientLogos.create, data)
  return res.data
}

export async function updateAdminClientLogo(id: string, data: ClientLogoForm) {
  const res = await api.put<ClientLogoAdmin>(endpoint.adminClientLogos.update(id), data)
  return res.data
}

export async function deleteAdminClientLogo(id: string) {
  const res = await api.delete(endpoint.adminClientLogos.delete(id))
  return res.data
}

export async function reorderAdminClientLogos(items: Array<{ id: string; order: number }>) {
  const res = await api.put(endpoint.adminClientLogos.reorder, { items })
  return res.data
}

// ---- Credentials ----
export async function getAdminCredentials() {
  const res = await api.get<CredentialAdmin[]>(endpoint.adminCredentials.list)
  return res.data
}

export async function createAdminCredential(data: CredentialForm) {
  const res = await api.post<CredentialAdmin>(endpoint.adminCredentials.create, data)
  return res.data
}

export async function updateAdminCredential(id: string, data: CredentialForm) {
  const res = await api.put<CredentialAdmin>(endpoint.adminCredentials.update(id), data)
  return res.data
}

export async function deleteAdminCredential(id: string) {
  const res = await api.delete(endpoint.adminCredentials.delete(id))
  return res.data
}

export async function reorderAdminCredentials(items: Array<{ id: string; order: number }>) {
  const res = await api.put(endpoint.adminCredentials.reorder, { items })
  return res.data
}

// ---- FAQs ----
export async function getAdminFaqs(params?: { scope?: string; serviceId?: string }) {
  const res = await api.get<FaqItemAdmin[]>(endpoint.adminFaqs.list, { params })
  return res.data
}

export async function createAdminFaq(data: FaqItemForm) {
  const res = await api.post<FaqItemAdmin>(endpoint.adminFaqs.create, data)
  return res.data
}

export async function updateAdminFaq(id: string, data: FaqItemForm) {
  const res = await api.put<FaqItemAdmin>(endpoint.adminFaqs.update(id), data)
  return res.data
}

export async function deleteAdminFaq(id: string) {
  const res = await api.delete(endpoint.adminFaqs.delete(id))
  return res.data
}

export async function reorderAdminFaqs(items: Array<{ id: string; order: number }>) {
  const res = await api.put(endpoint.adminFaqs.reorder, { items })
  return res.data
}
