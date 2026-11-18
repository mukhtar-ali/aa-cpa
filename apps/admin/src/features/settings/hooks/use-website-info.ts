import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getDefaultWebsiteInfo, type WebsiteInfoSectionModel } from '@repo/shared'
import { getWebsiteInfo, updateWebsiteInfo } from '@/lib/site-settings-api'

export function useWebsiteInfo() {
  return useQuery<WebsiteInfoSectionModel>({
    queryKey: ['site-settings', 'website-info'],
    queryFn: () => getWebsiteInfo().catch(() => getDefaultWebsiteInfo()),
  })
}

export function useUpdateWebsiteInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: WebsiteInfoSectionModel) => updateWebsiteInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'website-info'] })
      toast.success('Settings updated successfully')
    },
    onError: () => {
      toast.error('Failed to update settings')
    },
  })
}
