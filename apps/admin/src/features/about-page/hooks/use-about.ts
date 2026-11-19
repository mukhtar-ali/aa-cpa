import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAboutContentSection,
  getAboutCoreValuesSection,
  getAboutHeroSection,
  getAboutLeadershipSection,
  getAboutMissionVisionSection,
  getAboutPartnersSection,
  type AboutContentSectionModel,
  type AboutCoreValuesSectionModel,
  type AboutHeroSectionModel,
  type AboutLeadershipSectionModel,
  type AboutMissionVisionSectionModel,
  type AboutPartnersSectionModel,
} from '@repo/shared'
import {
  getAboutContent,
  getAboutCoreValues,
  getAboutHero,
  getAboutLeadership,
  getAboutMissionVision,
  getAboutPartners,
  updateAboutContent,
  updateAboutCoreValues,
  updateAboutHero,
  updateAboutLeadership,
  updateAboutMissionVision,
  updateAboutPartners,
} from '@/lib/about-api'

export function useAboutHero() {
  return useQuery<AboutHeroSectionModel>({
    queryKey: ['about-page', 'hero'],
    queryFn: () => getAboutHero().catch(() => getAboutHeroSection()),
  })
}
export function useUpdateAboutHero() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AboutHeroSectionModel) => updateAboutHero(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-page', 'hero'] })
      toast.success('About hero updated successfully')
    },
    onError: () => toast.error('Failed to update about hero'),
  })
}

export function useAboutContent() {
  return useQuery<AboutContentSectionModel>({
    queryKey: ['about-page', 'content'],
    queryFn: () => getAboutContent().catch(() => getAboutContentSection()),
  })
}
export function useUpdateAboutContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AboutContentSectionModel) => updateAboutContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-page', 'content'] })
      toast.success('About content updated successfully')
    },
    onError: () => toast.error('Failed to update about content'),
  })
}

export function useAboutMissionVision() {
  return useQuery<AboutMissionVisionSectionModel>({
    queryKey: ['about-page', 'mission-vision'],
    queryFn: () => getAboutMissionVision().catch(() => getAboutMissionVisionSection()),
  })
}
export function useUpdateAboutMissionVision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AboutMissionVisionSectionModel) => updateAboutMissionVision(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-page', 'mission-vision'] })
      toast.success('Mission & vision updated successfully')
    },
    onError: () => toast.error('Failed to update mission & vision'),
  })
}

export function useAboutCoreValues() {
  return useQuery<AboutCoreValuesSectionModel>({
    queryKey: ['about-page', 'core-values'],
    queryFn: () => getAboutCoreValues().catch(() => getAboutCoreValuesSection()),
  })
}
export function useUpdateAboutCoreValues() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AboutCoreValuesSectionModel) => updateAboutCoreValues(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-page', 'core-values'] })
      toast.success('Core values updated successfully')
    },
    onError: () => toast.error('Failed to update core values'),
  })
}

export function useAboutLeadership() {
  return useQuery<AboutLeadershipSectionModel>({
    queryKey: ['about-page', 'leadership'],
    queryFn: () => getAboutLeadership().catch(() => getAboutLeadershipSection()),
  })
}
export function useUpdateAboutLeadership() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AboutLeadershipSectionModel) => updateAboutLeadership(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-page', 'leadership'] })
      toast.success('Leadership updated successfully')
    },
    onError: () => toast.error('Failed to update leadership'),
  })
}

export function useAboutPartners() {
  return useQuery<AboutPartnersSectionModel>({
    queryKey: ['about-page', 'partners'],
    queryFn: () => getAboutPartners().catch(() => getAboutPartnersSection()),
  })
}
export function useUpdateAboutPartners() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AboutPartnersSectionModel) => updateAboutPartners(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-page', 'partners'] })
      toast.success('Partners updated successfully')
    },
    onError: () => toast.error('Failed to update partners'),
  })
}
