import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getDefaultEmailSettings, type EmailSettingsModel } from '@repo/shared'
import { getEmailSettings, sendTestEmail, updateEmailSettings } from '@/lib/site-settings-api'

export function useEmailSettings() {
  return useQuery<EmailSettingsModel>({
    queryKey: ['site-settings', 'email-settings'],
    queryFn: () => getEmailSettings().catch(() => getDefaultEmailSettings()),
  })
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EmailSettingsModel) => updateEmailSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'email-settings'] })
      toast.success('Email settings saved')
    },
    onError: (error) => {
      // Show the server's reason, e.g. "Re-enter the SMTP password when you change the host...".
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
      toast.error(typeof message === 'string' ? message : 'Failed to save email settings')
    },
  })
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: (to: string) => sendTestEmail(to),
    onSuccess: (data) => {
      toast.success(data.message)
    },
    onError: () => {
      toast.error('Failed to send test email — check your SMTP settings')
    },
  })
}
