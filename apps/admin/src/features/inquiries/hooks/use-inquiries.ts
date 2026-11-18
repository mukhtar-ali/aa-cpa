import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getInquiries, deleteInquiry } from '@/lib/inquiries-api'

export function useInquiries(page: number = 1, pageSize: number = 10, search?: string) {
  return useQuery({
    queryKey: ['inquiries', page, pageSize, search],
    queryFn: () => getInquiries({ pageNumber: page, pageSize, search }),
    // Keep showing the previous page/search while the next one loads: without it a new page or search term
    // has no cached data, so the whole table (including the search box) is replaced by a skeleton.
    placeholderData: keepPreviousData,
  })
}

export function useDeleteInquiry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteInquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] })
      toast.success('Inquiry deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete inquiry')
    },
  })
}
