import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getDefaultPageHero, type ListingHeroPage, type PageHeroModel } from '@repo/shared'
import { getPageHero, updatePageHero } from '@/lib/page-hero-api'

export function usePageHero(page: ListingHeroPage) {
  return useQuery<PageHeroModel>({
    queryKey: ['page-hero', page],
    // Nothing saved yet (404) → start the form from empty defaults.
    queryFn: () => getPageHero(page).catch(() => getDefaultPageHero()),
  })
}

export function useUpdatePageHero(page: ListingHeroPage) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PageHeroModel) => updatePageHero(page, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-hero', page] })
      toast.success('Page hero updated successfully')
    },
    onError: () => toast.error('Failed to update page hero'),
  })
}
