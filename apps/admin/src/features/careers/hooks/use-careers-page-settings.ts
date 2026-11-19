import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getDefaultCareersPageSettings, type CareersPageSettingsModel } from '@repo/shared'
import { getCareersPageSettings, updateCareersPageSettings } from '@/lib/careers-api'

export function useCareersPageSettings() {
  return useQuery<CareersPageSettingsModel>({
    queryKey: ['careers-page', 'settings'],
    queryFn: () => getCareersPageSettings().catch(() => getDefaultCareersPageSettings()),
  })
}

export function useUpdateCareersPageSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CareersPageSettingsModel) => updateCareersPageSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careers-page', 'settings'] })
      toast.success('Careers page settings updated successfully')
    },
    onError: () => toast.error('Failed to update careers page settings'),
  })
}
