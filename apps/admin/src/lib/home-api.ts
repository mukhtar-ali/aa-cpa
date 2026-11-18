import {
  endpoint,
  type HomeAboutTeaserSectionModel,
  type HomeHeroSectionModel,
  type HomeShowcaseSectionModel,
} from '@repo/shared'
import { api } from './api'

export async function getHomeHero() {
  const res = await api.get<HomeHeroSectionModel>(endpoint.home.hero)
  return res.data
}
export async function updateHomeHero(data: HomeHeroSectionModel) {
  const res = await api.put<HomeHeroSectionModel>(endpoint.home.hero, data)
  return res.data
}

export async function getHomeShowcase() {
  const res = await api.get<HomeShowcaseSectionModel>(endpoint.home.showcase)
  return res.data
}
export async function updateHomeShowcase(data: HomeShowcaseSectionModel) {
  const res = await api.put<HomeShowcaseSectionModel>(endpoint.home.showcase, data)
  return res.data
}

export async function getHomeAboutTeaser() {
  const res = await api.get<HomeAboutTeaserSectionModel>(endpoint.home.aboutTeaser)
  return res.data
}
export async function updateHomeAboutTeaser(data: HomeAboutTeaserSectionModel) {
  const res = await api.put<HomeAboutTeaserSectionModel>(endpoint.home.aboutTeaser, data)
  return res.data
}
