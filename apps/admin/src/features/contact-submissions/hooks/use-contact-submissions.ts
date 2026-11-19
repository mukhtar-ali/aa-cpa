import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ContactModel, ContactQueryModel, ContactStatusModel, PaginatorModel } from '@repo/shared'
import {
  deleteContactSubmission,
  getContactSubmissions,
  getContactSubmissionsUnreadCount,
  updateContactSubmissionStatus,
} from '@/lib/contact-submissions-api'

export function useContactSubmissions(query: ContactQueryModel) {
  return useQuery<PaginatorModel<ContactModel>>({
    queryKey: ['contact-submissions', query],
    queryFn: () => getContactSubmissions(query),
    // Keep showing the previous page/search while the next one loads: without it a new page or search term
    // has no cached data, so the whole table (including the search box) is replaced by a skeleton.
    placeholderData: keepPreviousData,
  })
}

export function useContactSubmissionsUnreadCount() {
  return useQuery({
    queryKey: ['contact-submissions', 'unread-count'],
    queryFn: getContactSubmissionsUnreadCount,
    refetchInterval: 30_000,
  })
}

export function useUpdateContactSubmissionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactStatusModel }) =>
      updateContactSubmissionStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] })
      toast.success('Status updated')
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })
}

export function useDeleteContactSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteContactSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] })
      toast.success('Submission deleted')
    },
    onError: () => {
      toast.error('Failed to delete submission')
    },
  })
}
