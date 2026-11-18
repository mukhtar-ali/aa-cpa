import { endpoint, type InquiryModel, type InquiryQueryModel, type PaginatorModel } from '@repo/shared'
import { api } from './api'

export async function getInquiries(query: InquiryQueryModel) {
    const res = await api.get<PaginatorModel<InquiryModel>>(endpoint.inquiry.list, { params: query })
    return res.data
}

export async function getInquiryById(id: string) {
    const res = await api.get<InquiryModel>(`${endpoint.inquiry.getById}/${id}`)
    return res.data
}

export async function deleteInquiry(id: string) {
    const res = await api.delete(`${endpoint.inquiry.delete}/${id}`)
    return res.data
}
