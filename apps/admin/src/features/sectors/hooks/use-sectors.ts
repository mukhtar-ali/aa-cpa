import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { SectorForm } from '@repo/shared'
import {
  createAdminSector,
  deleteAdminSector,
  getAdminSectors,
  publishAdminSector,
  reorderAdminSectors,
  updateAdminSector,
} from '@/lib/sectors-api'

export function useAdminSectors(params?: { page?: number; limit?: number; q?: string; isPublished?: boolean }) {
  return useQuery({
    queryKey: ['admin-sectors', params],
    queryFn: () => getAdminSectors(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateAdminSector() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SectorForm) => createAdminSector(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sectors'] })
      toast.success('Sector created successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create sector')
    },
  })
}

export function useUpdateAdminSector() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SectorForm }) => updateAdminSector(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sectors'] })
      toast.success('Sector updated successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update sector')
    },
  })
}

export function useDeleteAdminSector() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdminSector(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sectors'] })
      toast.success('Sector deleted successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Cannot delete referenced sector')
    },
  })
}

export function usePublishAdminSector() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      publishAdminSector(id, isPublished),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-sectors'] })
      toast.success(vars.isPublished ? 'Sector published' : 'Sector moved to draft')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update publish state')
    },
  })
}

export function useReorderAdminSectors() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: Array<{ id: string; order: number }>) => reorderAdminSectors(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sectors'] })
      toast.success('Sectors order saved')
    },
    onError: () => {
      toast.error('Failed to reorder sectors')
    },
  })
}
