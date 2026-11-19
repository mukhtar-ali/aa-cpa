import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { NewsFormModel, NewsModel, NewsQueryModel, PaginatorModel } from '@repo/shared'
import { createNews, deleteNews, getNews, updateNews } from '@/lib/news-api'

export function useNews(query: NewsQueryModel) {
  return useQuery<PaginatorModel<NewsModel>>({
    queryKey: ['news', query],
    queryFn: () => getNews(query),
    // Keep showing the previous page/search while the next one loads: without it a new page or search term
    // has no cached data, so the whole table (including the search box) is replaced by a skeleton.
    placeholderData: keepPreviousData,
  })
}

export function useCreateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NewsFormModel) => createNews(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('News article created successfully')
    },
    onError: () => {
      toast.error('Failed to create news article')
    },
  })
}

export function useUpdateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NewsFormModel }) => updateNews(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('News article updated successfully')
    },
    onError: () => {
      toast.error('Failed to update news article')
    },
  })
}

export function useDeleteNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
      toast.success('News article deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete news article')
    },
  })
}
