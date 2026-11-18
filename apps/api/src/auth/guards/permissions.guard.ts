import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionEnum } from '@repo/shared';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<PermissionEnum[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredPermissions || requiredPermissions.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const userPermissions: PermissionEnum[] = request.user.permissions;
        if (!userPermissions) throw new ForbiddenException('Permissions not found');

        if (!requiredPermissions.every((p) => userPermissions.includes(p))) {
            throw new ForbiddenException('You do not have the required permissions');
        }
        return true;
    }
}
