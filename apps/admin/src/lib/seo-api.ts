import { endpoint, type SeoContentModel } from '@repo/shared'
import { api } from './api'

export async function getSeo(pageKey: string) {
    const res = await api.get<{ pageKey: string; content: SeoContentModel } | null>(endpoint.seo.getByPageKey, {
        params: { pageKey },
    })
    return res.data
}

export async function updateSeo(pageKey: string, content: SeoContentModel) {
    const res = await api.put<{ pageKey: string; content: SeoContentModel }>(endpoint.seo.update, {
        pageKey,
        content,
    })
    return res.data
}
