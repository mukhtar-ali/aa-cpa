import { endpoint, type ListingHeroPage, type PageHeroModel } from '@repo/shared'
import { api } from './api'

export async function getPageHero(page: ListingHeroPage) {
  const res = await api.get<PageHeroModel>(`${endpoint.pageHero.base}/${page}`)
  return res.data
}

export async function updatePageHero(page: ListingHeroPage, data: PageHeroModel) {
  const res = await api.put<PageHeroModel>(`${endpoint.pageHero.base}/${page}`, data)
  return res.data
}
