import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  JobApplicationModel,
  JobApplicationQueryModel,
  JobApplicationStatusModel,
  PaginatorModel,
} from '@repo/shared'
import {
  deleteJobApplication,
  getJobApplications,
  updateJobApplicationStatus,
} from '@/lib/careers-api'

export function useJobApplications(query: JobApplicationQueryModel) {
  return useQuery<PaginatorModel<JobApplicationModel>>({
    queryKey: ['job-applications', query],
    queryFn: () => getJobApplications(query),
    // Keep showing the previous page/search while the next one loads: without it a new page or search term
    // has no cached data, so the whole table (including the search box) is replaced by a skeleton.
    placeholderData: keepPreviousData,
  })
}

export function useUpdateJobApplicationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobApplicationStatusModel }) =>
      updateJobApplicationStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] })
      toast.success('Application status updated')
    },
    onError: () => {
      toast.error('Failed to update application status')
    },
  })
}

export function useDeleteJobApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteJobApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] })
      toast.success('Application deleted')
    },
    onError: () => {
      toast.error('Failed to delete application')
    },
  })
}
