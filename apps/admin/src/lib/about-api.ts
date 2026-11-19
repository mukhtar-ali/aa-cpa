import {
  endpoint,
  type AboutContentSectionModel,
  type AboutCoreValuesSectionModel,
  type AboutHeroSectionModel,
  type AboutLeadershipSectionModel,
  type AboutMissionVisionSectionModel,
  type AboutPartnersSectionModel,
} from '@repo/shared'
import { api } from './api'

export async function getAboutHero() {
  const res = await api.get<AboutHeroSectionModel>(endpoint.about.hero)
  return res.data
}
export async function updateAboutHero(data: AboutHeroSectionModel) {
  const res = await api.put<AboutHeroSectionModel>(endpoint.about.hero, data)
  return res.data
}

export async function getAboutContent() {
  const res = await api.get<AboutContentSectionModel>(endpoint.about.content)
  return res.data
}
export async function updateAboutContent(data: AboutContentSectionModel) {
  const res = await api.put<AboutContentSectionModel>(endpoint.about.content, data)
  return res.data
}

export async function getAboutMissionVision() {
  const res = await api.get<AboutMissionVisionSectionModel>(endpoint.about.missionVision)
  return res.data
}
export async function updateAboutMissionVision(data: AboutMissionVisionSectionModel) {
  const res = await api.put<AboutMissionVisionSectionModel>(endpoint.about.missionVision, data)
  return res.data
}

export async function getAboutCoreValues() {
  const res = await api.get<AboutCoreValuesSectionModel>(endpoint.about.coreValues)
  return res.data
}
export async function updateAboutCoreValues(data: AboutCoreValuesSectionModel) {
  const res = await api.put<AboutCoreValuesSectionModel>(endpoint.about.coreValues, data)
  return res.data
}

export async function getAboutLeadership() {
  const res = await api.get<AboutLeadershipSectionModel>(endpoint.about.leadership)
  return res.data
}
export async function updateAboutLeadership(data: AboutLeadershipSectionModel) {
  const res = await api.put<AboutLeadershipSectionModel>(endpoint.about.leadership, data)
  return res.data
}

export async function getAboutPartners() {
  const res = await api.get<AboutPartnersSectionModel>(endpoint.about.partners)
  return res.data
}
export async function updateAboutPartners(data: AboutPartnersSectionModel) {
  const res = await api.put<AboutPartnersSectionModel>(endpoint.about.partners, data)
  return res.data
}
