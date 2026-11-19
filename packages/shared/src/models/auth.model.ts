import { z } from 'zod';
import { PermissionEnum } from '../enums';
import { CanResetPasswordSchema, ForgetPasswordSchema, LoginSchema, ResetPasswordSchema } from '../validations';

export interface JwtPayloadModel {
    id: string;
}

export interface CurrentUserModel {
    id: string;
    permissions: PermissionEnum[];
}

export type LoginModel = z.infer<typeof LoginSchema>;
export type CanResetPasswordModel = z.infer<typeof CanResetPasswordSchema>;
export type ForgetPasswordModel = z.infer<typeof ForgetPasswordSchema>;
export type ResetPasswordModel = z.infer<typeof ResetPasswordSchema>;
