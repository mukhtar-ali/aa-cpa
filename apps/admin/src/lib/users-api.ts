import {
    endpoint,
    type AddUserToAdminPortalModel,
    type AdminViewUserModel,
    type PaginationParamsModel,
    type PaginatorModel,
    type PermissionEnum,
    type UpdatePermissionsModel,
} from '@repo/shared'
import { api } from './api'

export async function getUsers(query: PaginationParamsModel) {
    const res = await api.get<PaginatorModel<AdminViewUserModel>>(endpoint.admin.listUsers, { params: query })
    return res.data
}

export async function createUser(data: AddUserToAdminPortalModel) {
    const res = await api.post(endpoint.admin.createUser, data)
    return res.data
}

export async function deleteUser(id: string) {
    const res = await api.delete(`${endpoint.admin.deleteUser}/${id}`)
    return res.data
}

export async function updatePermissions(data: UpdatePermissionsModel) {
    const res = await api.post(endpoint.users.updatePermissions, data)
    return res.data
}

export async function getUserPermissions(userId: string) {
    const res = await api.get<{ permissions: PermissionEnum[] }>(`${endpoint.users.getPermissionsByUserId}/${userId}`)
    return res.data
}

export async function setUserActive(id: string, isActive: boolean) {
    const res = await api.post<{ message: string }>(`${endpoint.admin.setUserActive}/${id}`, { isActive })
    return res.data
}
