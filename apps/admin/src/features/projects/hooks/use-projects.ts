import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { PaginatorModel, ProjectFormModel, ProjectModel, ProjectQueryModel } from '@repo/shared'
import { createProject, deleteProject, getProjects, updateProject } from '@/lib/projects-api'

interface ProjectsCountResult {
  total: number
  published: number
  draft: number
}

export function useProjectsCount() {
  return useQuery<ProjectsCountResult>({
    queryKey: ['projects', 'count'],
    queryFn: async () => {
      const [all, published] = await Promise.all([
        getProjects({ pageNumber: 1, pageSize: 1 }),
        getProjects({ pageNumber: 1, pageSize: 1, isPublished: true }),
      ])
      const total: number = all?.totalCount ?? 0
      const publishedCount: number = published?.totalCount ?? 0
      return {
        total,
        published: publishedCount,
        draft: total - publishedCount,
      }
    },
  })
}

export function useProjects(query: ProjectQueryModel) {
  return useQuery<PaginatorModel<ProjectModel>>({
    queryKey: ['projects', query],
    queryFn: () => getProjects(query),
    // Keep showing the previous page/search while the next one loads: without it a new page or search term
    // has no cached data, so the whole table (including the search box) is replaced by a skeleton.
    placeholderData: keepPreviousData,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProjectFormModel) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
    },
    onError: () => {
      toast.error('Failed to create project')
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectFormModel }) => updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated successfully')
    },
    onError: () => {
      toast.error('Failed to update project')
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })
}
