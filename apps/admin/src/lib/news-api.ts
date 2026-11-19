import {
  endpoint,
  type NewsFormModel,
  type NewsModel,
  type NewsQueryModel,
  type PaginatorModel,
} from '@repo/shared'
import { api } from './api'
import { toQueryParams } from './table-filters'

export type NewsResponse = PaginatorModel<NewsModel>

export async function getNews(query: NewsQueryModel) {
  const res = await api.get<NewsResponse>(endpoint.news.list, { params: toQueryParams(query) })
  return res.data
}

export async function getNewsById(id: string) {
  const res = await api.get<{ news: NewsModel }>(`${endpoint.news.getById}/${id}`)
  return res.data
}

export async function createNews(data: NewsFormModel) {
  const res = await api.post<{ news: NewsModel }>(endpoint.news.create, data)
  return res.data
}

export async function updateNews(id: string, data: NewsFormModel) {
  const res = await api.put<{ news: NewsModel }>(`${endpoint.news.update}/${id}`, data)
  return res.data
}

export async function deleteNews(id: string) {
  const res = await api.delete(`${endpoint.news.delete}/${id}`)
  return res.data
}
