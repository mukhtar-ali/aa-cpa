import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ServiceForm } from '@repo/shared'
import {
  createAdminService,
  deleteAdminService,
  getAdminServices,
  issuePreviewToken,
  publishAdminService,
  reorderAdminServices,
  updateAdminService,
} from '@/lib/services-api'

export function useAdminServices(params?: { page?: number; limit?: number; q?: string; isPublished?: boolean }) {
  return useQuery({
    queryKey: ['admin-services', params],
    queryFn: () => getAdminServices(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateAdminService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ServiceForm) => createAdminService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      toast.success('Service created successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create service')
    },
  })
}

export function useUpdateAdminService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceForm }) => updateAdminService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      toast.success('Service updated successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update service')
    },
  })
}

export function useDeleteAdminService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdminService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      toast.success('Service deleted successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Cannot delete referenced service')
    },
  })
}

export function usePublishAdminService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      publishAdminService(id, isPublished),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      toast.success(vars.isPublished ? 'Service published' : 'Service moved to draft')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update publish state')
    },
  })
}

export function useReorderAdminServices() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: Array<{ id: string; order: number }>) => reorderAdminServices(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      toast.success('Services order saved')
    },
    onError: () => {
      toast.error('Failed to reorder services')
    },
  })
}

export function usePreviewEntity() {
  return useMutation({
    mutationFn: ({
      kind,
      key,
    }: {
      kind: 'page' | 'service' | 'sector' | 'article' | 'job'
      key: string
    }) => issuePreviewToken(kind, key),
    onSuccess: (res) => {
      if (typeof window !== 'undefined' && res.url) {
        window.open(res.url, '_blank', 'noopener,noreferrer')
      }
      toast.success('Preview opened in new tab')
    },
    onError: () => {
      toast.error('Failed to generate preview token')
    },
  })
}
