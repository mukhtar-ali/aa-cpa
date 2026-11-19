import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getDefaultSeoContent, type SeoContentModel } from '@repo/shared'
import { getSeo, updateSeo } from '@/lib/seo-api'

export function useSeo(pageKey: string) {
  return useQuery({
    queryKey: ['site-settings', 'seo', pageKey],
    queryFn: async () => {
      const result = await getSeo(pageKey)
      return result?.content ?? getDefaultSeoContent()
    },
    enabled: !!pageKey,
  })
}

export function useUpdateSeo(pageKey: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: SeoContentModel) => updateSeo(pageKey, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'seo', pageKey] })
      toast.success('SEO settings updated successfully')
    },
    onError: () => {
      toast.error('Failed to update SEO settings')
    },
  })
}
