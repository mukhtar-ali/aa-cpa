import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { JobFormModel, JobModel, JobQueryModel, PaginatorModel } from '@repo/shared'
import { createJob, deleteJob, getJobs, updateJob } from '@/lib/careers-api'

export function useJobs(query: JobQueryModel) {
  return useQuery<PaginatorModel<JobModel>>({
    queryKey: ['jobs', query],
    queryFn: () => getJobs(query),
    // Keep showing the previous page/search while the next one loads: without it a new page or search term
    // has no cached data, so the whole table (including the search box) is replaced by a skeleton.
    placeholderData: keepPreviousData,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: JobFormModel) => createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job posting created successfully')
    },
    onError: () => {
      toast.error('Failed to create job posting')
    },
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobFormModel }) => updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job posting updated successfully')
    },
    onError: () => {
      toast.error('Failed to update job posting')
    },
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job posting deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete job posting')
    },
  })
}
