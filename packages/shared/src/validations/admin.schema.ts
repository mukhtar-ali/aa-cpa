import { z } from 'zod';
import { PermissionEnum } from '../enums';
import { emailValidation } from './base.schema';

export const fullNameValidation = z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name is too long');

export const AddUserToAdminPortalSchema = z.object({
    fullName: fullNameValidation,
    email: emailValidation,
});

export const UpdatePermissionsSchema = z.object({
    userId: z.string().min(1, 'Invalid user ID format'),
    // Only real permission values are accepted (this used to be an open string[]).
    permissions: z.array(z.nativeEnum(PermissionEnum)).max(Object.values(PermissionEnum).length),
});

export const SetUserActiveSchema = z.object({
    isActive: z.boolean(),
});
