import { BadRequestException } from '@nestjs/common';
import { PermissionEnum, SetUserActiveSchema, UpdatePermissionsSchema } from '@repo/shared';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { PERMISSIONS_KEY } from '@/auth/decorators/permissions.decorator';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { UsersController } from './users.controller';

describe('UsersController (MUK-464)', () => {
    let usersService: {
        updatePermissions: jest.Mock;
        setActive: jest.Mock;
        deleteUser: jest.Mock;
        getUsers: jest.Mock;
    };
    let controller: UsersController;
    const caller = {
        id: 'admin-1',
        permissions: [PermissionEnum.PermissionsUpdate, PermissionEnum.AdminPortalUsersActivate],
    };

    beforeEach(() => {
        usersService = {
            updatePermissions: jest.fn().mockResolvedValue(undefined),
            setActive: jest.fn().mockResolvedValue({ message: 'User deactivated.' }),
            deleteUser: jest.fn().mockResolvedValue({ message: 'User deleted successfully.' }),
            getUsers: jest.fn(),
        };
        controller = new UsersController(usersService as never);
    });

    describe('updatePermissions', () => {
        it("passes the CALLER's permissions to the service (not the target's)", async () => {
            const data = { userId: 'user-2', permissions: [PermissionEnum.AdminPortalUsersView] };
            await expect(controller.updatePermissions(caller, data)).resolves.toEqual({
                message: 'Permissions updated successfully.',
            });
            expect(usersService.updatePermissions).toHaveBeenCalledWith(caller.permissions, 'user-2', data);
        });

        it('refuses to let a user edit their own permissions', async () => {
            await expect(
                controller.updatePermissions(caller, { userId: 'admin-1', permissions: [] }),
            ).rejects.toThrow(new BadRequestException('You cannot update your own permissions.'));
            expect(usersService.updatePermissions).not.toHaveBeenCalled();
        });
    });

    describe('setUserActive', () => {
        it('deactivates another user, passing the caller permissions for the hierarchy check', async () => {
            await expect(controller.setUserActive(caller, 'user-2', { isActive: false })).resolves.toEqual({
                message: 'User deactivated.',
            });
            expect(usersService.setActive).toHaveBeenCalledWith(caller.permissions, 'user-2', false);
        });

        it('refuses to let a user change their own active status (no self-lockout)', async () => {
            await expect(controller.setUserActive(caller, 'admin-1', { isActive: false })).rejects.toThrow(
                new BadRequestException('You cannot change your own active status.'),
            );
            expect(usersService.setActive).not.toHaveBeenCalled();
        });

        it('requires the AdminPortalUsersActivate permission', () => {
            const required = Reflect.getMetadata(PERMISSIONS_KEY, UsersController.prototype.setUserActive);
            expect(required).toEqual([PermissionEnum.AdminPortalUsersActivate]);
        });

        it('validates the body with the shared SetUserActiveSchema', () => {
            const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, UsersController, 'setUserActive') as Record<
                string,
                { pipes: unknown[] }
            >;
            const bodyPipes = Object.entries(args).find(([key]) => key.startsWith('3:'))?.[1].pipes ?? [];
            const zodPipe = bodyPipes.find((p) => p instanceof CustomZodValidationPipe) as unknown as { schema: unknown };
            expect(zodPipe.schema).toBe(SetUserActiveSchema);
            expect(SetUserActiveSchema.safeParse({ isActive: 'yes' }).success).toBe(false);
            expect(SetUserActiveSchema.safeParse({}).success).toBe(false);
            expect(SetUserActiveSchema.safeParse({ isActive: true }).success).toBe(true);
        });
    });

    describe('deleteUser', () => {
        it('passes the caller permissions to the service and still blocks self-deletion', async () => {
            await controller.deleteUser(caller, 'user-2');
            expect(usersService.deleteUser).toHaveBeenCalledWith(caller.permissions, 'user-2');
            await expect(controller.deleteUser(caller, 'admin-1')).rejects.toThrow(BadRequestException);
        });
    });

    describe('getUsers', () => {
        it('includes isActive in each listed user', async () => {
            usersService.getUsers.mockResolvedValue({
                items: [{ id: 'u1', fullName: 'A', email: 'a@x.co', username: 'a', isActive: false, password: 'must-not-leak' }],
                totalCount: 1,
                pageNumber: 1,
                pageSize: 10,
                totalPages: 1,
            });
            const result = await controller.getUsers({ pageNumber: 1, pageSize: 10 } as never);
            expect(result.items).toEqual([{ id: 'u1', fullName: 'A', email: 'a@x.co', username: 'a', isActive: false }]);
        });
    });

    describe('permission payload validation (shared schema)', () => {
        it('accepts real permissions and rejects unknown strings', () => {
            expect(
                UpdatePermissionsSchema.safeParse({ userId: 'u', permissions: [PermissionEnum.AdminPortalUsersView] }).success,
            ).toBe(true);
            expect(UpdatePermissionsSchema.safeParse({ userId: 'u', permissions: ['root', 'admin.*'] }).success).toBe(false);
            expect(UpdatePermissionsSchema.safeParse({ userId: 'u', permissions: [] }).success).toBe(true);
        });
    });
});
