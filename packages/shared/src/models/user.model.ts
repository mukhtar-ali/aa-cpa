import { z } from 'zod';
import {
    ChangeEmailSchema, ChangePasswordSchema, ChangeUsernameSchema, UpdateFullNameSchema,
    SetUserActiveSchema, UpdatePermissionsSchema,
} from '../validations';

export type ChangePasswordModel = z.infer<typeof ChangePasswordSchema>;
export type ChangeEmailModel = z.infer<typeof ChangeEmailSchema>;
export type ChangeUsernameModel = z.infer<typeof ChangeUsernameSchema>;
export type UpdateFullNameModel = z.infer<typeof UpdateFullNameSchema>;
export type UpdatePermissionsModel = z.infer<typeof UpdatePermissionsSchema>;
export type SetUserActiveModel = z.infer<typeof SetUserActiveSchema>;

export enum OtpType {
    ForgetPassword = 'forget_password',
}
