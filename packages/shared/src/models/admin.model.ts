import { z } from 'zod';
import { PermissionEnum } from '../enums';
import { AddUserToAdminPortalSchema } from '../validations';

export type AddUserToAdminPortalModel = z.infer<typeof AddUserToAdminPortalSchema>;

export interface AdminViewUserModel {
    id: string;
    fullName: string;
    email: string;
    username: string;
    // Present on the admin users list; absent on the auth profile.
    isActive?: boolean;
}

export interface AdminAuthUserModel extends AdminViewUserModel {
    premissions: PermissionEnum[];
}
