import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
    AddUserToAdminPortalModel, ALL_PERMISSIONS, CanResetPasswordModel,
    ChangeEmailModel, ChangePasswordModel, ChangeUsernameModel, createRandomOtp, createRandomPassword, createUsername,
    ForgetPasswordModel, PaginationParamsModel, PermissionEnum,
    ResetPasswordModel, UpdatePermissionsModel,
} from '@repo/shared';
import * as bcrypt from 'bcrypt';
import { customEnv } from '@/config/custom-env';
import { EmailService } from '@/email/email.service';
import { PrismaService } from '@/prisma/prisma.service';
import { buildPaginationResult } from '@/common/pagination/pagination.util';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private prisma: PrismaService,
        private readonly emailService: EmailService,
    ) {}

    async addUserToAdminPortal(data: AddUserToAdminPortalModel) {
        const existingUser = await this.findByEmail(data.email, false);
        if (existingUser) throw new BadRequestException('User with this email already exists');

        const createdPassword = createRandomPassword();
        let username = createUsername(data.fullName);
        while (await this.getByUsername(username, false)) {
            username = createUsername(data.fullName);
        }

        const user = await this.prisma.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                username,
                password: await bcrypt.hash(createdPassword, 10),
                permissions: [],
            },
        });

        this.emailService.sendEmail(user.email, 'Welcome to the Admin Portal', 'new-user-to-admin-portal', {
            fullName: user.fullName, email: user.email, username: user.username,
            supportEmail: customEnv.SUPPORT_EMAIL,
            loginUrl: customEnv.ADMIN_PORTAL_URL + '/sign-in',
            tempPassword: createdPassword,
        }).catch(err => this.logger.error({ err }, 'Failed to send welcome email'));
    }

    async changePassword(userId: string, data: ChangePasswordModel) {
        const user = await this.getById(userId);
        const isPasswordValid = await this.validatePassword(data.oldPassword, user.password);
        if (!isPasswordValid) throw new BadRequestException('Old password is incorrect');
        if (data.newPassword !== data.passwordConfirmation) throw new BadRequestException('Password confirmation does not match');
        await this.prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(data.newPassword, 10) } });
    }

    async updateFullName(userId: string, fullName: string) {
        await this.getById(userId);
        await this.prisma.user.update({ where: { id: userId }, data: { fullName } });
    }

    async changeUsername(userId: string, data: ChangeUsernameModel) {
        const user = await this.getById(userId);
        const isPasswordValid = await this.validatePassword(data.password, user.password);
        if (!isPasswordValid) throw new BadRequestException('Password is incorrect');
        const existing = await this.getByUsername(data.newUsername, false);
        if (existing && existing.id !== userId) throw new BadRequestException('Username is already taken');
        await this.prisma.user.update({ where: { id: userId }, data: { username: data.newUsername } });
    }

    async changeEmail(userId: string, data: ChangeEmailModel) {
        const user = await this.getById(userId);
        const isPasswordValid = await this.validatePassword(data.password, user.password);
        if (!isPasswordValid) throw new BadRequestException('Password is incorrect');
        const existing = await this.findByEmail(data.newEmail, false);
        if (existing && existing.id !== userId) throw new BadRequestException('Email is already in use');
        await this.prisma.user.update({ where: { id: userId }, data: { email: data.newEmail } });
    }

    async findByEmail(email: string, withException = true) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user && withException) throw new NotFoundException('User not found');
        return user;
    }

    async getById(id: string, withException = true) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user && withException) throw new NotFoundException('User not found');
        return user;
    }

    async getByUsername(username: string, withException = true) {
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user && withException) throw new NotFoundException('User not found');
        return user;
    }

    /**
     * A caller may only manage (edit permissions of, activate/deactivate, delete) a user whose
     * permissions are all ones the caller also holds. Without this, anyone with a single
     * management permission could act on a super admin or hand a second account every permission.
     */
    private assertCanManage(actorPermissions: PermissionEnum[], target: { permissions: unknown }): void {
        const actor = new Set(actorPermissions);
        const targetPermissions = (target.permissions as PermissionEnum[] | null) ?? [];
        if (targetPermissions.some((permission) => !actor.has(permission))) {
            throw new ForbiddenException('You cannot manage a user who holds permissions you do not have.');
        }
    }

    /**
     * Replaces a user's permissions. The caller is already authorized for PermissionsUpdate by the
     * controller decorator, so (unlike before) the TARGET is not required to hold it: new users
     * start with none, which made granting permissions to anyone impossible. Instead the caller
     * must hold every permission they grant, and every permission the target currently has.
     */
    async updatePermissions(actorPermissions: PermissionEnum[], userId: string, data: UpdatePermissionsModel) {
        const user = await this.getById(userId);
        if (user.isDeleted) throw new NotFoundException('User not found');

        const requested = [...new Set(data.permissions)];
        const unknown = requested.filter((permission) => !ALL_PERMISSIONS.includes(permission));
        if (unknown.length > 0) throw new BadRequestException('Unknown permission value.');

        this.assertCanManage(actorPermissions, user);
        const actor = new Set(actorPermissions);
        if (requested.some((permission) => !actor.has(permission))) {
            throw new ForbiddenException('You cannot grant permissions you do not hold.');
        }

        await this.prisma.user.update({ where: { id: userId }, data: { permissions: requested } });
    }

    /** Activates or deactivates a user. Deactivating also revokes all of their refresh tokens. */
    async setActive(actorPermissions: PermissionEnum[], userId: string, isActive: boolean) {
        const user = await this.getById(userId);
        if (user.isDeleted) throw new NotFoundException('User not found');
        this.assertCanManage(actorPermissions, user);

        const operations = [this.prisma.user.update({ where: { id: userId }, data: { isActive } })];
        if (!isActive) {
            operations.push(
                this.prisma.refreshToken.updateMany({
                    where: { userId, revokedAt: null },
                    data: { revokedAt: new Date() },
                }) as never,
            );
        }
        await this.prisma.$transaction(operations);
        return { message: isActive ? 'User activated.' : 'User deactivated.' };
    }

    async getPermissions(userId: string): Promise<PermissionEnum[]> {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { permissions: true } });
        if (!user) throw new NotFoundException('User not found');
        return user.permissions as PermissionEnum[];
    }

    async deleteUser(actorPermissions: PermissionEnum[], id: string) {
        const target = await this.getById(id);
        this.assertCanManage(actorPermissions, target);
        const now = new Date();
        // Deactivate as well as soft-delete, and revoke every refresh token, so the account cannot
        // refresh into a new access token (the AuthGuard also rejects it immediately).
        await this.prisma.$transaction([
            this.prisma.user.update({ where: { id }, data: { isDeleted: true, isActive: false, deletedAt: now } }),
            this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: now } }),
        ]);
        return { message: 'User deleted successfully.' };
    }

    async forgetPassword(data: ForgetPasswordModel) {
        const user = await this.findByEmail(data.email, false);
        // Deleted accounts get no OTP (same silent response as an unknown email).
        if (!user || user.isDeleted) return;

        const otp = createRandomOtp(6);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await this.prisma.userOtp.create({
            data: { userId: user.id, otp, expiresAt, type: 'forget_password', isUsed: false },
        });

        this.emailService.sendEmail(user.email, 'Your Password Reset OTP', 'forget-password', {
            fullName: user.fullName,
            resetOtp: otp,
            supportEmail: customEnv.SUPPORT_EMAIL,
            resetLink: `${customEnv.ADMIN_PORTAL_URL}/reset-password?email=${encodeURIComponent(user.email)}&otp=${encodeURIComponent(otp)}`,
        }).catch(err => this.logger.error({ err }, 'Failed to send password reset email'));
    }

    async canResetPassword(data: CanResetPasswordModel): Promise<boolean> {
        const user = await this.findByEmail(data.email);
        if (user.isDeleted) throw new NotFoundException('User not found');
        const userOtp = await this.prisma.userOtp.findFirst({
            where: { userId: user.id, otp: data.otp, type: 'forget_password', isUsed: false, expiresAt: { gt: new Date() } },
        });
        return !!userOtp;
    }

    async resetPassword(data: ResetPasswordModel) {
        const user = await this.findByEmail(data.email);
        if (user.isDeleted) throw new NotFoundException('User not found');
        const userOtp = await this.prisma.userOtp.findFirst({
            where: { userId: user.id, otp: data.otp, type: 'forget_password', isUsed: false, expiresAt: { gt: new Date() } },
        });
        if (!userOtp) throw new BadRequestException('Invalid or expired OTP');
        if (data.newPassword !== data.passwordConfirmation) throw new BadRequestException('Password confirmation does not match');
        await this.prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(data.newPassword, 10) } });
        await this.prisma.userOtp.update({ where: { id: userOtp.id }, data: { isUsed: true } });
    }

    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async getUsers(data: PaginationParamsModel) {
        const { pageNumber = 1, pageSize = 10 } = data;
        const search = data.search?.trim();
        const where: any = { isDeleted: false };
        if (search) {
            where.OR = [
                { fullName: { contains: search } },
                { email: { contains: search } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.user.findMany({
                where, skip: (pageNumber - 1) * pageSize, take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: { id: true, fullName: true, email: true, username: true, isActive: true },
            }),
            this.prisma.user.count({ where }),
        ]);
        return buildPaginationResult(items, total, pageNumber, pageSize);
    }

    async updateSuperAdminPermissions(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
            await this.prisma.user.update({ where: { id: user.id }, data: { permissions: ALL_PERMISSIONS } });
        }
    }
}
