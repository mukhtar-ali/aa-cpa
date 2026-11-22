import { AddUserToAdminPortalSchema, type AddUserToAdminPortalModel, type AdminViewUserModel } from '@repo/shared'

export type User = AdminViewUserModel

export const createUserSchema = AddUserToAdminPortalSchema
export type CreateUser = AddUserToAdminPortalModel
