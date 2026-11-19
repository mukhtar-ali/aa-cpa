import { endpoint, type ContactFormSectionModel, type ContactHeroSectionModel } from '@repo/shared'
import { api } from './api'

export async function getContactHero() {
  const res = await api.get<ContactHeroSectionModel>(endpoint.contact.hero)
  return res.data
}
export async function updateContactHero(data: ContactHeroSectionModel) {
  const res = await api.put<ContactHeroSectionModel>(endpoint.contact.hero, data)
  return res.data
}

export async function getContactFormSection() {
  const res = await api.get<ContactFormSectionModel>(endpoint.contact.form)
  return res.data
}
export async function updateContactFormSection(data: ContactFormSectionModel) {
  const res = await api.put<ContactFormSectionModel>(endpoint.contact.form, data)
  return res.data
}
