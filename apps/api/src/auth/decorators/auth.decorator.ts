import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RequirePermissions } from './permissions.decorator';
import { PermissionEnum } from '@repo/shared';
import { PermissionsGuard } from '../guards/permissions.guard';

export const Protected = () => UseGuards(AuthGuard);

export const ProtectedWithPermissions = (...permissions: PermissionEnum[]) =>
    applyDecorators(UseGuards(AuthGuard, PermissionsGuard), RequirePermissions(...permissions));
