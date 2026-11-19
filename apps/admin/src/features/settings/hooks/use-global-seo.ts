import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getDefaultGlobalSeoSettings, type GlobalSeoSettingsModel } from '@repo/shared'
import { getGlobalSeo, updateGlobalSeo } from '@/lib/site-settings-api'

export function useGlobalSeo() {
  return useQuery<GlobalSeoSettingsModel>({
    queryKey: ['site-settings', 'seo-global'],
    queryFn: () => getGlobalSeo().catch(() => getDefaultGlobalSeoSettings()),
  })
}

export function useUpdateGlobalSeo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GlobalSeoSettingsModel) => updateGlobalSeo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'seo-global'] })
      toast.success('SEO & tracking settings updated successfully')
    },
    onError: () => {
      toast.error('Failed to update SEO & tracking settings')
    },
  })
}
