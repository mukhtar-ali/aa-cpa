import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PermissionEnum } from '@repo/shared';
import { UsersService } from './users.service';

const ALL = Object.values(PermissionEnum);

describe('UsersService deleted-account handling (MUK-465)', () => {
    let prisma: {
        user: { findUnique: jest.Mock; update: jest.Mock };
        refreshToken: { updateMany: jest.Mock };
        userOtp: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
        $transaction: jest.Mock;
    };
    let emailService: { sendEmail: jest.Mock };
    let service: UsersService;

    const activeUser = {
        id: 'user-1',
        email: 'person@example.com',
        fullName: 'Person',
        isActive: true,
        isDeleted: false,
    };

    beforeEach(() => {
        prisma = {
            user: { findUnique: jest.fn(), update: jest.fn().mockReturnValue('user-update-op') },
            refreshToken: { updateMany: jest.fn().mockReturnValue('revoke-op') },
            userOtp: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
            $transaction: jest.fn().mockResolvedValue([]),
        };
        emailService = { sendEmail: jest.fn().mockResolvedValue(undefined) };
        service = new UsersService(prisma as never, emailService as never);
    });

    describe('deleteUser', () => {
        it('soft-deletes AND deactivates the user and revokes all their refresh tokens in one transaction', async () => {
            prisma.user.findUnique.mockResolvedValue(activeUser);

            await expect(service.deleteUser(ALL, 'user-1')).resolves.toEqual({ message: 'User deleted successfully.' });

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: { isDeleted: true, isActive: false, deletedAt: expect.any(Date) },
            });
            expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
                where: { userId: 'user-1', revokedAt: null },
                data: { revokedAt: expect.any(Date) },
            });
            // Both writes are submitted together so they succeed or fail as one.
            expect(prisma.$transaction).toHaveBeenCalledWith(['user-update-op', 'revoke-op']);
        });

        it('does not touch anything when the user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(service.deleteUser(ALL, 'ghost')).rejects.toThrow(NotFoundException);

            expect(prisma.$transaction).not.toHaveBeenCalled();
            expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
        });
    });

    describe('forgetPassword', () => {
        it('issues an OTP and emails an active user', async () => {
            prisma.user.findUnique.mockResolvedValue(activeUser);
            await service.forgetPassword({ email: activeUser.email });
            expect(prisma.userOtp.create).toHaveBeenCalledTimes(1);
            expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
        });

        it('silently does nothing for a soft-deleted user (no OTP, no email)', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...activeUser, isDeleted: true });
            await expect(service.forgetPassword({ email: activeUser.email })).resolves.toBeUndefined();
            expect(prisma.userOtp.create).not.toHaveBeenCalled();
            expect(emailService.sendEmail).not.toHaveBeenCalled();
        });

        it('silently does nothing for an unknown email', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            await expect(service.forgetPassword({ email: 'nobody@example.com' })).resolves.toBeUndefined();
            expect(prisma.userOtp.create).not.toHaveBeenCalled();
        });
    });

    describe('OTP verification and reset for deleted accounts', () => {
        const deleted = { ...activeUser, isDeleted: true };

        it('canResetPassword reports "not found" and never looks up an OTP', async () => {
            prisma.user.findUnique.mockResolvedValue(deleted);
            await expect(service.canResetPassword({ email: deleted.email, otp: '123456' })).rejects.toThrow(
                NotFoundException,
            );
            expect(prisma.userOtp.findFirst).not.toHaveBeenCalled();
        });

        it('resetPassword reports "not found" and never changes the password', async () => {
            prisma.user.findUnique.mockResolvedValue(deleted);
            await expect(
                service.resetPassword({
                    email: deleted.email,
                    otp: '123456',
                    newPassword: 'NewPassw0rd!',
                    passwordConfirmation: 'NewPassw0rd!',
                }),
            ).rejects.toThrow(NotFoundException);
            expect(prisma.userOtp.findFirst).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled();
        });
    });

    describe('deleteUser hierarchy (MUK-464)', () => {
        it('refuses to delete a user who holds permissions the caller lacks (e.g. a super admin)', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...activeUser, permissions: ALL });
            await expect(service.deleteUser([PermissionEnum.AdminPortalUsersDelete], 'super')).rejects.toThrow(
                ForbiddenException,
            );
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        it('allows deleting a user whose permissions are a subset of the caller\'s', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...activeUser, permissions: [PermissionEnum.AdminPortalUsersView] });
            await expect(
                service.deleteUser([PermissionEnum.AdminPortalUsersDelete, PermissionEnum.AdminPortalUsersView], 'user-1'),
            ).resolves.toEqual({ message: 'User deleted successfully.' });
        });
    });
});

describe('UsersService permissions management (MUK-464)', () => {
    let prisma: {
        user: { findUnique: jest.Mock; update: jest.Mock };
        refreshToken: { updateMany: jest.Mock };
        $transaction: jest.Mock;
    };
    let service: UsersService;

    const caller = [
        PermissionEnum.PermissionsUpdate,
        PermissionEnum.AdminPortalUsersView,
        PermissionEnum.AdminPortalManageContent,
        PermissionEnum.AdminPortalUsersActivate,
    ];
    // A brand-new user: starts with NO permissions (this is what made the old code fail).
    const newUser = { id: 'new-user', isDeleted: false, isActive: true, permissions: [] as PermissionEnum[] };

    beforeEach(() => {
        prisma = {
            user: { findUnique: jest.fn().mockResolvedValue(newUser), update: jest.fn().mockReturnValue('user-update-op') },
            refreshToken: { updateMany: jest.fn().mockReturnValue('revoke-op') },
            $transaction: jest.fn().mockResolvedValue([]),
        };
        service = new UsersService(prisma as never, { sendEmail: jest.fn() } as never);
    });

    describe('updatePermissions', () => {
        it('grants permissions to a brand-new user who holds none (the original bug: it threw 400)', async () => {
            await expect(
                service.updatePermissions(caller, 'new-user', {
                    userId: 'new-user',
                    permissions: [PermissionEnum.AdminPortalUsersView, PermissionEnum.AdminPortalManageContent],
                }),
            ).resolves.toBeUndefined();

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'new-user' },
                data: { permissions: [PermissionEnum.AdminPortalUsersView, PermissionEnum.AdminPortalManageContent] },
            });
        });

        it('de-duplicates the requested permissions', async () => {
            await service.updatePermissions(caller, 'new-user', {
                userId: 'new-user',
                permissions: [PermissionEnum.AdminPortalUsersView, PermissionEnum.AdminPortalUsersView],
            });
            expect(prisma.user.update.mock.calls[0][0].data.permissions).toEqual([PermissionEnum.AdminPortalUsersView]);
        });

        it('lets the caller clear all of a user\'s permissions', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...newUser, permissions: [PermissionEnum.AdminPortalUsersView] });
            await service.updatePermissions(caller, 'new-user', { userId: 'new-user', permissions: [] });
            expect(prisma.user.update.mock.calls[0][0].data.permissions).toEqual([]);
        });

        it('refuses to grant a permission the caller does not hold (no second-account escalation)', async () => {
            await expect(
                service.updatePermissions(caller, 'new-user', {
                    userId: 'new-user',
                    permissions: [PermissionEnum.AdminPortalUsersDelete],
                }),
            ).rejects.toThrow(new ForbiddenException('You cannot grant permissions you do not hold.'));
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('refuses to edit a user who holds a permission the caller lacks (cannot demote a more powerful user)', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...newUser, permissions: [PermissionEnum.AdminPortalUsersDelete] });
            await expect(
                service.updatePermissions(caller, 'new-user', { userId: 'new-user', permissions: [] }),
            ).rejects.toThrow(ForbiddenException);
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('rejects unknown permission strings even if the controller pipe was bypassed', async () => {
            await expect(
                service.updatePermissions(caller, 'new-user', {
                    userId: 'new-user',
                    permissions: ['not.a.real.permission'] as never,
                }),
            ).rejects.toThrow(BadRequestException);
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('treats a soft-deleted or missing user as not found', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...newUser, isDeleted: true });
            await expect(
                service.updatePermissions(caller, 'new-user', { userId: 'new-user', permissions: [] }),
            ).rejects.toThrow(NotFoundException);
            prisma.user.findUnique.mockResolvedValue(null);
            await expect(
                service.updatePermissions(caller, 'ghost', { userId: 'ghost', permissions: [] }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('setActive', () => {
        it('deactivates a user AND revokes all their refresh tokens in one transaction', async () => {
            await expect(service.setActive(caller, 'new-user', false)).resolves.toEqual({ message: 'User deactivated.' });

            expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'new-user' }, data: { isActive: false } });
            expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
                where: { userId: 'new-user', revokedAt: null },
                data: { revokedAt: expect.any(Date) },
            });
            expect(prisma.$transaction).toHaveBeenCalledWith(['user-update-op', 'revoke-op']);
        });

        it('reactivates without touching refresh tokens', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...newUser, isActive: false });
            await expect(service.setActive(caller, 'new-user', true)).resolves.toEqual({ message: 'User activated.' });
            expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
            expect(prisma.$transaction).toHaveBeenCalledWith(['user-update-op']);
        });

        it('refuses to change a user who holds permissions the caller lacks', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...newUser, permissions: ALL });
            await expect(service.setActive(caller, 'super', false)).rejects.toThrow(ForbiddenException);
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        it('treats a soft-deleted user as not found', async () => {
            prisma.user.findUnique.mockResolvedValue({ ...newUser, isDeleted: true });
            await expect(service.setActive(caller, 'new-user', true)).rejects.toThrow(NotFoundException);
        });
    });
});
