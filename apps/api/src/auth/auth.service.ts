import { UsersService } from '@/users/users.service';
import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadModel, LoginModel } from '@repo/shared';
import { createHash, randomBytes } from 'crypto';

const LOCKOUT_MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const LOCKOUT_WINDOW_MINUTES = 15;
const REFRESH_TOKEN_TTL_DAYS = 7;
export const REFRESH_REUSE_GRACE_SECONDS = 30;

interface LoginAttemptInput {
    userId: string | null;
    email: string;
    success: boolean;
    ipAddress: string;
    userAgent?: string;
    failureReason: string | null;
}

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private prisma: PrismaService,
    ) {}

    /**
     * Authenticates a user and, on success, issues both an access token (returned to
     * the caller) and a refresh token (persisted hashed, plaintext returned so the
     * controller can set it as an httpOnly cookie). Locks the account for
     * `LOCKOUT_DURATION_MINUTES` after `LOCKOUT_MAX_ATTEMPTS` failed attempts within
     * `LOCKOUT_WINDOW_MINUTES`, matching wujud's auth.service.ts.
     */
    async login(
        data: LoginModel,
        ipAddress: string,
        userAgent?: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.usersService.findByEmail(data.email, false);

        if (!user) {
            await this.logLoginAttempt({
                userId: null,
                email: data.email,
                success: false,
                ipAddress,
                userAgent,
                failureReason: 'User not found',
            });
            throw new BadRequestException('Invalid email or password');
        }

        if (user.isDeleted) {
            // Same generic response as an unknown email so deleted accounts are not revealed.
            await this.logLoginAttempt({
                userId: user.id,
                email: data.email,
                success: false,
                ipAddress,
                userAgent,
                failureReason: 'Deleted account',
            });
            throw new BadRequestException('Invalid email or password');
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
            await this.logLoginAttempt({
                userId: user.id,
                email: data.email,
                success: false,
                ipAddress,
                userAgent,
                failureReason: 'Account locked',
            });
            throw new ForbiddenException(
                `Too many failed attempts. Try again in ${minutesRemaining} minute(s).`,
            );
        }

        const isPasswordValid = await this.usersService.validatePassword(data.password, user.password);
        if (!isPasswordValid) {
            await this.handleFailedLogin(user.id, data.email, ipAddress, userAgent, user.lastLoginAt);
            throw new BadRequestException('Invalid email or password');
        }

        if (!user.isActive) {
            await this.logLoginAttempt({
                userId: user.id,
                email: data.email,
                success: false,
                ipAddress,
                userAgent,
                failureReason: 'Inactive account',
            });
            throw new BadRequestException('Your account is inactive. Please contact support.');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
        });
        await this.logLoginAttempt({
            userId: user.id,
            email: data.email,
            success: true,
            ipAddress,
            userAgent,
            failureReason: null,
        });

        const payload: JwtPayloadModel = { id: user.id };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = await this.issueRefreshToken(user.id);

        return { accessToken, refreshToken };
    }

    private async handleFailedLogin(
        userId: string,
        email: string,
        ipAddress: string,
        userAgent?: string,
        lastLoginAt?: Date | null,
    ): Promise<void> {
        // Record this failure FIRST, then count. Counting before inserting let a burst of parallel
        // wrong guesses all read the same low count so none of them tripped the lock; inserting first
        // means concurrent requests see each other's rows and the lock engages mid-burst.
        const recorded = await this.logLoginAttempt({
            userId,
            email,
            success: false,
            ipAddress,
            userAgent,
            failureReason: 'Invalid password',
        });

        const lockoutWindow = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60000);
        // A successful login clears the slate: only failures after it count toward a lock.
        const since = lastLoginAt && lastLoginAt > lockoutWindow ? lastLoginAt : lockoutWindow;
        const recentFailures = await this.prisma.loginAttempt.count({
            // Account-wide on purpose: counting per (user, IP) let an attacker rotate IPs and get
            // LOCKOUT_MAX_ATTEMPTS - 1 free guesses from each one. Only wrong-password attempts
            // count: 'Account locked' / 'Inactive account' rows (retries during a lock) must not
            // re-trigger a lock the moment the previous one expires.
            where: { userId, success: false, failureReason: 'Invalid password', createdAt: { gte: since } },
        });
        // This attempt's own row is already included above. If its insert failed (audit errors are
        // swallowed), count it explicitly so a broken audit table cannot switch the lockout off.
        const newFailedCount = recentFailures + (recorded ? 0 : 1);

        const data: { failedLoginAttempts: number; lockedUntil?: Date } = {
            failedLoginAttempts: newFailedCount,
        };
        if (newFailedCount >= LOCKOUT_MAX_ATTEMPTS) {
            const lockUntil = new Date();
            lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
            data.lockedUntil = lockUntil;
        }

        await this.prisma.user.update({ where: { id: userId }, data });
    }

    /** Returns whether the audit row was written; failures never block login itself. */
    private async logLoginAttempt(attempt: LoginAttemptInput): Promise<boolean> {
        try {
            await this.prisma.loginAttempt.create({ data: attempt });
            return true;
        } catch {
            return false;
        }
    }

    private async issueRefreshToken(userId: string): Promise<string> {
        const token = randomBytes(48).toString('hex');
        const hashedToken = createHash('sha256').update(token).digest('hex');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

        await this.prisma.refreshToken.create({ data: { userId, token: hashedToken, expiresAt } });
        return token;
    }

    /**
     * Validates and rotates a refresh token, issuing a new access JWT and a new
     * refresh token. Tokens explicitly revoked via logout or password change/reset
     * (`rotatedAt === null`) are rejected immediately. Tokens revoked by rotation
     * (`rotatedAt !== null`) allow a short grace window (`REFRESH_REUSE_GRACE_SECONDS`)
     * for benign concurrent-tab refreshes; replays outside the grace window trigger
     * reuse detection and revoke all active refresh tokens for the user.
     */
    async refreshAccessToken(
        refreshToken: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const hashedToken = createHash('sha256').update(refreshToken).digest('hex');
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: hashedToken },
            include: { user: true },
        });

        if (!tokenRecord) throw new UnauthorizedException('Invalid refresh token');

        const now = new Date();
        if (tokenRecord.expiresAt < now) {
            throw new UnauthorizedException('Refresh token has expired');
        }
        if (!tokenRecord.user.isActive || tokenRecord.user.isDeleted) {
            throw new UnauthorizedException('User account is not active');
        }

        if (tokenRecord.revokedAt) {
            if (!tokenRecord.rotatedAt) {
                throw new UnauthorizedException('Refresh token has been revoked');
            }
            const ageSeconds = (now.getTime() - tokenRecord.rotatedAt.getTime()) / 1000;
            if (ageSeconds > REFRESH_REUSE_GRACE_SECONDS) {
                await this.revokeAllRefreshTokens(tokenRecord.userId);
                throw new UnauthorizedException('Refresh token reuse detected');
            }
        } else {
            await this.prisma.refreshToken.updateMany({
                where: { id: tokenRecord.id, revokedAt: null },
                data: { revokedAt: now, rotatedAt: now },
            });
        }

        const payload: JwtPayloadModel = { id: tokenRecord.user.id };
        const accessToken = this.jwtService.sign(payload);
        const newRefreshToken = await this.issueRefreshToken(tokenRecord.user.id);

        return { accessToken, refreshToken: newRefreshToken };
    }

    /** Revokes a single refresh token — the token itself is the proof of ownership. */
    async revokeRefreshToken(refreshToken: string): Promise<void> {
        const hashedToken = createHash('sha256').update(refreshToken).digest('hex');
        await this.prisma.refreshToken.updateMany({
            where: { token: hashedToken, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    /** Revokes every active session for a user — used on password change/reset and refresh-token reuse detection. */
    async revokeAllRefreshTokens(userId: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    async getUserViewModel(userId: string) {
        return await this.usersService.getById(userId);
    }
}
