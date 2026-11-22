import { SetMetadata } from '@nestjs/common';
import { PermissionEnum } from '@repo/shared';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermissionEnum[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);
