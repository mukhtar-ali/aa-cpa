import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getDefaultHomeAboutTeaserSection,
  getDefaultHomeHeroSection,
  getDefaultHomeShowcaseSection,
  type HomeAboutTeaserSectionModel,
  type HomeHeroSectionModel,
  type HomeShowcaseSectionModel,
} from '@repo/shared'
import {
  getHomeAboutTeaser,
  getHomeHero,
  getHomeShowcase,
  updateHomeAboutTeaser,
  updateHomeHero,
  updateHomeShowcase,
} from '@/lib/home-api'

export function useHomeHero() {
  return useQuery<HomeHeroSectionModel>({
    queryKey: ['home', 'hero'],
    queryFn: () => getHomeHero().catch(() => getDefaultHomeHeroSection()),
  })
}
export function useUpdateHomeHero() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: HomeHeroSectionModel) => updateHomeHero(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'hero'] })
      toast.success('Home hero updated successfully')
    },
    onError: () => toast.error('Failed to update home hero'),
  })
}

export function useHomeShowcase() {
  return useQuery<HomeShowcaseSectionModel>({
    queryKey: ['home', 'showcase'],
    queryFn: () => getHomeShowcase().catch(() => getDefaultHomeShowcaseSection()),
  })
}
export function useUpdateHomeShowcase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: HomeShowcaseSectionModel) => updateHomeShowcase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'showcase'] })
      toast.success('Showcase updated successfully')
    },
    onError: () => toast.error('Failed to update showcase'),
  })
}

export function useHomeAboutTeaser() {
  return useQuery<HomeAboutTeaserSectionModel>({
    queryKey: ['home', 'about-teaser'],
    queryFn: () => getHomeAboutTeaser().catch(() => getDefaultHomeAboutTeaserSection()),
  })
}
export function useUpdateHomeAboutTeaser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: HomeAboutTeaserSectionModel) => updateHomeAboutTeaser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'about-teaser'] })
      toast.success('About teaser updated successfully')
    },
    onError: () => toast.error('Failed to update about teaser'),
  })
}
