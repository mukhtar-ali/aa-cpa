import {
    endpoint,
    type PaginatorModel,
    type ProjectFormModel,
    type ProjectModel,
    type ProjectQueryModel,
} from '@repo/shared'
import { api } from './api'
import { toQueryParams } from './table-filters'

export type ProjectsResponse = PaginatorModel<ProjectModel>

export async function getProjects(query: ProjectQueryModel) {
    const res = await api.get<ProjectsResponse>(endpoint.project.list, { params: toQueryParams(query) })
    return res.data
}

export async function getProjectById(id: string) {
    const res = await api.get<{ project: ProjectModel }>(`${endpoint.project.getById}/${id}`)
    return res.data
}

export async function createProject(data: ProjectFormModel) {
    const res = await api.post<{ project: ProjectModel }>(endpoint.project.create, data)
    return res.data
}

export async function updateProject(id: string, data: ProjectFormModel) {
    const res = await api.put<{ project: ProjectModel }>(`${endpoint.project.update}/${id}`, data)
    return res.data
}

export async function deleteProject(id: string) {
    const res = await api.delete(`${endpoint.project.delete}/${id}`)
    return res.data
}
