import {
    endpoint,
    type PaginatorModel,
    type UnitFormModel,
    type UnitModel,
    type UnitQueryModel,
} from '@repo/shared'
import { api } from './api'
import { toQueryParams } from './table-filters'

export type UnitsResponse = PaginatorModel<UnitModel>

export async function getUnits(query: UnitQueryModel) {
    const res = await api.get<UnitsResponse>(endpoint.units.list, { params: toQueryParams(query) })
    return res.data
}

export async function getUnitById(id: string) {
    const res = await api.get<UnitModel>(`${endpoint.units.getById}/${id}`)
    return res.data
}

export async function createUnit(projectId: string, data: UnitFormModel) {
    const res = await api.post<{ unit: UnitModel }>(
        `${endpoint.units.create}/${projectId}/units`,
        data
    )
    return res.data
}

export async function updateUnit(id: string, data: UnitFormModel) {
    const res = await api.put<{ unit: UnitModel }>(`${endpoint.units.update}/${id}`, data)
    return res.data
}

export async function deleteUnit(id: string) {
    const res = await api.delete(`${endpoint.units.delete}/${id}`)
    return res.data
}
