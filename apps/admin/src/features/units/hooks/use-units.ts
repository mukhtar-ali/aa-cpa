import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { PaginatorModel, ProjectModel, UnitFormModel, UnitModel, UnitQueryModel } from '@repo/shared'
import { getProjectById } from '@/lib/projects-api'
import { createUnit, deleteUnit, getUnitById, getUnits, updateUnit } from '@/lib/units-api'

export function useUnits(query: UnitQueryModel) {
  return useQuery<PaginatorModel<UnitModel>>({
    queryKey: ['units', query],
    queryFn: () => getUnits(query),
    // Keep showing the previous page/search while the next one loads (otherwise the whole table, including the
    // search box, is swapped for a skeleton on every keystroke). Only for the SAME project: never show another
    // project's units while this one loads.
    placeholderData: (previous, previousQuery) =>
      (previousQuery?.queryKey[1] as { projectId?: string } | undefined)?.projectId === query.projectId ? previous : undefined,
  })
}

export function useUnit(id: string) {
  return useQuery<UnitModel>({
    queryKey: ['units', id],
    queryFn: () => getUnitById(id),
    enabled: Boolean(id),
  })
}

export function useParentProject(projectId: string) {
  return useQuery<ProjectModel>({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const res = await getProjectById(projectId)
      return 'project' in res && res.project ? res.project : (res as unknown as ProjectModel)
    },
    enabled: Boolean(projectId),
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UnitFormModel }) =>
      createUnit(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      toast.success('Unit created successfully')
    },
    onError: () => {
      toast.error('Failed to create unit')
    },
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitFormModel }) => updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      toast.success('Unit updated successfully')
    },
    onError: () => {
      toast.error('Failed to update unit')
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      toast.success('Unit deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete unit')
    },
  })
}
