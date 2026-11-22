import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';
import { AuthService, REFRESH_REUSE_GRACE_SECONDS } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let prisma: {
        user: { update: jest.Mock };
        loginAttempt: { count: jest.Mock; create: jest.Mock };
        refreshToken: { create: jest.Mock; findUnique: jest.Mock; updateMany: jest.Mock };
    };
    let usersService: {
        findByEmail: jest.Mock;
        validatePassword: jest.Mock;
        getById: jest.Mock;
    };
    let jwtService: {
        sign: jest.Mock;
    };

    const baseUser = {
        id: 'user-123',
        email: 'admin@example.com',
        fullName: 'Admin User',
        username: 'admin',
        password: '$2b$10$hashedpassword',
        isActive: true,
        isDeleted: false,
        permissions: [],
        failedLoginAttempts: 0,
        lockedUntil: null as Date | null,
        lastLoginAt: null as Date | null,
    };

    beforeEach(async () => {
        prisma = {
            user: {
                update: jest.fn().mockResolvedValue(baseUser),
            },
            loginAttempt: {
                count: jest.fn().mockResolvedValue(0),
                create: jest.fn().mockResolvedValue({ id: 'attempt-1' }),
            },
            refreshToken: {
                create: jest
                    .fn()
                    .mockImplementation(({ data }) =>
                        Promise.resolve({ id: 'rt-1', revokedAt: null, rotatedAt: null, ...data }),
                    ),
                findUnique: jest.fn(),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
        };

        usersService = {
            findByEmail: jest.fn(),
            validatePassword: jest.fn(),
            getById: jest.fn(),
        };

        jwtService = {
            sign: jest.fn().mockReturnValue('signed-access-jwt'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: prisma },
                { provide: UsersService, useValue: usersService },
                { provide: JwtService, useValue: jwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('login and account lockout', () => {
        it('rejects unknown email with BadRequestException and logs a failed LoginAttempt with userId=null', async () => {
            usersService.findByEmail.mockResolvedValue(null);

            await expect(
                service.login({ email: 'missing@example.com', password: 'Password1!' }, '127.0.0.1', 'jest-agent'),
            ).rejects.toThrow(new BadRequestException('Invalid email or password'));

            expect(usersService.findByEmail).toHaveBeenCalledWith('missing@example.com', false);
            expect(prisma.loginAttempt.create).toHaveBeenCalledWith({
                data: {
                    userId: null,
                    email: 'missing@example.com',
                    success: false,
                    ipAddress: '127.0.0.1',
                    userAgent: 'jest-agent',
                    failureReason: 'User not found',
                },
            });
        });

        it('refuses to log in a soft-deleted account with the generic error and records a "Deleted account" attempt (MUK-465)', async () => {
            usersService.findByEmail.mockResolvedValue({ ...baseUser, isDeleted: true });
            usersService.validatePassword.mockResolvedValue(true); // even with the right password

            await expect(
                service.login({ email: baseUser.email, password: 'Password1!' }, '10.0.0.1', 'agent'),
            ).rejects.toThrow(new BadRequestException('Invalid email or password'));

            expect(usersService.validatePassword).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled(); // no lastLoginAt / failure counters touched
            expect(prisma.refreshToken.create).not.toHaveBeenCalled(); // no session issued
            expect(prisma.loginAttempt.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ userId: baseUser.id, success: false, failureReason: 'Deleted account' }),
            });
        });

        it('increments failedLoginAttempts without locking for fewer than 5 failed attempts within 15 minutes', async () => {
            usersService.findByEmail.mockResolvedValue({ ...baseUser });
            usersService.validatePassword.mockResolvedValue(false);
            // The count includes this attempt's own row: 4 failures in the window (< 5)
            prisma.loginAttempt.count.mockResolvedValue(4);

            const beforeCall = Date.now();
            await expect(
                service.login({ email: baseUser.email, password: 'wrong' }, '10.0.0.1', 'Mozilla/5.0'),
            ).rejects.toThrow(new BadRequestException('Invalid email or password'));

            expect(prisma.loginAttempt.count).toHaveBeenCalledWith({
                where: {
                    userId: baseUser.id,
                    success: false,
                    failureReason: 'Invalid password',
                    createdAt: { gte: expect.any(Date) },
                },
            });
            const windowArg = prisma.loginAttempt.count.mock.calls[0][0].where.createdAt.gte as Date;
            // Window must be ~15 minutes before now
            expect(beforeCall - windowArg.getTime()).toBeGreaterThanOrEqual(15 * 60 * 1000 - 1000);
            expect(beforeCall - windowArg.getTime()).toBeLessThanOrEqual(15 * 60 * 1000 + 2000);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: baseUser.id },
                data: { failedLoginAttempts: 4 },
            });
            expect(prisma.user.update.mock.calls[0][0].data.lockedUntil).toBeUndefined();

            expect(prisma.loginAttempt.create).toHaveBeenCalledWith({
                data: {
                    userId: baseUser.id,
                    email: baseUser.email,
                    success: false,
                    ipAddress: '10.0.0.1',
                    userAgent: 'Mozilla/5.0',
                    failureReason: 'Invalid password',
                },
            });
        });

        it('counts failed attempts account-wide, regardless of the source IP (no per-IP free guesses)', async () => {
            usersService.findByEmail.mockResolvedValue({ ...baseUser });
            usersService.validatePassword.mockResolvedValue(false);
            prisma.loginAttempt.count.mockResolvedValue(5);

            await expect(
                service.login({ email: baseUser.email, password: 'wrong' }, '203.0.113.77', 'rotating-ip'),
            ).rejects.toThrow(new BadRequestException('Invalid email or password'));

            const where = prisma.loginAttempt.count.mock.calls[0][0].where;
            expect(where).not.toHaveProperty('ipAddress');
            // 5 failures counted (from any IPs, including this one) -> account is locked
            expect(prisma.user.update.mock.calls[0][0].data.lockedUntil).toBeInstanceOf(Date);
            // The IP is still recorded for the audit trail.
            expect(prisma.loginAttempt.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ ipAddress: '203.0.113.77', failureReason: 'Invalid password' }),
            });
        });

        it('does not count retries made while locked or on inactive accounts toward the next lock', async () => {
            usersService.findByEmail.mockResolvedValue({ ...baseUser });
            usersService.validatePassword.mockResolvedValue(false);

            await expect(
                service.login({ email: baseUser.email, password: 'wrong' }, '10.0.0.1', 'agent'),
            ).rejects.toThrow(BadRequestException);

            // Only wrong-password rows are counted ('Account locked' / 'Inactive account' are excluded).
            expect(prisma.loginAttempt.count.mock.calls[0][0].where.failureReason).toBe('Invalid password');
        });

        it('only counts failures after the last successful login when that login is inside the window', async () => {
            const lastLoginAt = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
            usersService.findByEmail.mockResolvedValue({ ...baseUser, lastLoginAt });
            usersService.validatePassword.mockResolvedValue(false);
            prisma.loginAttempt.count.mockResolvedValue(1);

            await expect(
                service.login({ email: baseUser.email, password: 'wrong' }, '10.0.0.1', 'agent'),
            ).rejects.toThrow(BadRequestException);

            expect(prisma.loginAttempt.count.mock.calls[0][0].where.createdAt.gte).toEqual(lastLoginAt);
            expect(prisma.user.update.mock.calls[0][0].data).toEqual({ failedLoginAttempts: 1 });
        });

        it('ignores a last successful login that is older than the 15-minute window', async () => {
            const lastLoginAt = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
            usersService.findByEmail.mockResolvedValue({ ...baseUser, lastLoginAt });
            usersService.validatePassword.mockResolvedValue(false);

            const before = Date.now();
            await expect(
                service.login({ email: baseUser.email, password: 'wrong' }, '10.0.0.1', 'agent'),
            ).rejects.toThrow(BadRequestException);

            const gte = prisma.loginAttempt.count.mock.calls[0][0].where.createdAt.gte as Date;
            expect(before - gte.getTime()).toBeGreaterThanOrEqual(15 * 60 * 1000 - 1000);
            expect(before - gte.getTime()).toBeLessThanOrEqual(15 * 60 * 1000 + 2000);
        });

        it('records the failed attempt BEFORE counting, so parallel guesses see each other and the lock engages', async () => {
            usersService.findByEmail.mockResolvedValue({ ...baseUser });
            usersService.validatePassword.mockResolvedValue(false);
            prisma.loginAttempt.count.mockResolvedValue(1);

            await expect(
                service.login({ email: baseUser.email, password: 'wrong' }, '10.0.0.1', 'agent'),
            ).rejects.toThrow(BadRequestException);

            const createdAt = prisma.loginAttempt.create.mock.invocationCallOrder[0];
            const countedAt = prisma.loginAttempt.count.mock.invocationCallOrder[0];
            expect(createdAt).toBeLessThan(countedAt);
        });

        it('still counts this attempt (and can lock) when the audit insert fails', async () => {
            usersService.findByEmail.mockResolvedValue({ ...baseUser });
            usersService.validatePassword.mockResolvedValue(false);
            prisma.loginAttempt.create.mockRejectedValue(new Error('audit table unavailable'));
            // The failed insert means this attempt is NOT in the 4 rows counted -> 4 + 1 = 5 -> lock
            prisma.loginAttempt.count.mockResolvedValue(4);

            await expect(
                service.login({ email: baseUser.email, password: 'wrong' }, '10.0.0.1', 'agent'),
            ).rejects.toThrow(new BadRequestException('Invalid email or password'));

            expect(prisma.user.update.mock.calls[0][0].data.failedLoginAttempts).toBe(5);
            expect(prisma.user.update.mock.calls[0][0].data.lockedUntil).toBeInstanceOf(Date);
        });

        it('locks the account for 15 minutes on the 5th failed attempt within 15 minutes', async () => {
            usersService.findByEmail.mockResolvedValue({ ...baseUser });
            usersService.validatePassword.mockResolvedValue(false);
            // 5 failed attempts in the last 15 minutes, this one included -> lock
            prisma.loginAttempt.count.mockResolvedValue(5);

            const beforeCall = Date.now();
            await expect(
                service.login({ email: baseUser.email, password: 'wrong' }, '10.0.0.1', 'Mozilla/5.0'),
            ).rejects.toThrow(new BadRequestException('Invalid email or password'));

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: baseUser.id },
                data: {
                    failedLoginAttempts: 5,
                    lockedUntil: expect.any(Date),
                },
            });

            const lockedUntil = prisma.user.update.mock.calls[0][0].data.lockedUntil as Date;
            const lockDurationMs = lockedUntil.getTime() - beforeCall;
            expect(lockDurationMs).toBeGreaterThanOrEqual(14 * 60 * 1000);
            expect(lockDurationMs).toBeLessThanOrEqual(16 * 60 * 1000);
        });

        it('rejects login with ForbiddenException while account is locked and logs Account locked', async () => {
            const lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes remaining
            usersService.findByEmail.mockResolvedValue({
                ...baseUser,
                failedLoginAttempts: 5,
                lockedUntil,
            });

            await expect(
                service.login({ email: baseUser.email, password: 'correct-password' }, '10.0.0.1', 'Mozilla/5.0'),
            ).rejects.toThrow(ForbiddenException);

            await expect(
                service.login({ email: baseUser.email, password: 'correct-password' }, '10.0.0.1', 'Mozilla/5.0'),
            ).rejects.toThrow(/Too many failed attempts\. Try again in \d+ minute\(s\)\./);

            // Must not even validate password while locked
            expect(usersService.validatePassword).not.toHaveBeenCalled();
            expect(prisma.loginAttempt.create).toHaveBeenCalledWith({
                data: {
                    userId: baseUser.id,
                    email: baseUser.email,
                    success: false,
                    ipAddress: '10.0.0.1',
                    userAgent: 'Mozilla/5.0',
                    failureReason: 'Account locked',
                },
            });
        });

        it('allows login after lock expiration and resets failedLoginAttempts and lockedUntil', async () => {
            const expiredLock = new Date(Date.now() - 60 * 1000); // expired 1 minute ago
            usersService.findByEmail.mockResolvedValue({
                ...baseUser,
                failedLoginAttempts: 5,
                lockedUntil: expiredLock,
            });
            usersService.validatePassword.mockResolvedValue(true);

            const result = await service.login(
                { email: baseUser.email, password: 'ValidPassword1!' },
                '10.0.0.1',
                'Mozilla/5.0',
            );

            expect(result.accessToken).toBe('signed-access-jwt');
            expect(result.refreshToken).toMatch(/^[a-f0-9]{96}$/);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: baseUser.id },
                data: {
                    failedLoginAttempts: 0,
                    lockedUntil: null,
                    lastLoginAt: expect.any(Date),
                },
            });
            expect(prisma.loginAttempt.create).toHaveBeenCalledWith({
                data: {
                    userId: baseUser.id,
                    email: baseUser.email,
                    success: true,
                    ipAddress: '10.0.0.1',
                    userAgent: 'Mozilla/5.0',
                    failureReason: null,
                },
            });
        });

        it('rejects inactive accounts with BadRequestException and logs Inactive account', async () => {
            usersService.findByEmail.mockResolvedValue({ ...baseUser, isActive: false });
            usersService.validatePassword.mockResolvedValue(true);

            await expect(
                service.login({ email: baseUser.email, password: 'ValidPassword1!' }, '10.0.0.1'),
            ).rejects.toThrow(new BadRequestException('Your account is inactive. Please contact support.'));

            expect(prisma.loginAttempt.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: baseUser.id,
                    success: false,
                    failureReason: 'Inactive account',
                }),
            });
        });

        it('does not block login when loginAttempt audit logging throws', async () => {
            usersService.findByEmail.mockResolvedValue({ ...baseUser });
            usersService.validatePassword.mockResolvedValue(true);
            prisma.loginAttempt.create.mockRejectedValue(new Error('DB write error'));

            await expect(
                service.login({ email: baseUser.email, password: 'ValidPassword1!' }, '10.0.0.1'),
            ).resolves.toEqual({
                accessToken: 'signed-access-jwt',
                refreshToken: expect.stringMatching(/^[a-f0-9]{96}$/),
            });
        });
    });

    describe('refresh token persistence, validation, rotation and revocation', () => {
        it('persists only the SHA-256 hash of the refresh token with a 7-day expiry on login', async () => {
            usersService.findByEmail.mockResolvedValue({ ...baseUser });
            usersService.validatePassword.mockResolvedValue(true);

            const beforeCall = Date.now();
            const { refreshToken } = await service.login(
                { email: baseUser.email, password: 'ValidPassword1!' },
                '10.0.0.1',
            );

            const expectedHash = createHash('sha256').update(refreshToken).digest('hex');
            expect(expectedHash).not.toBe(refreshToken);

            expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
            const createArg = prisma.refreshToken.create.mock.calls[0][0].data;
            expect(createArg.userId).toBe(baseUser.id);
            expect(createArg.token).toBe(expectedHash);

            const ttlMs = (createArg.expiresAt as Date).getTime() - beforeCall;
            expect(ttlMs).toBeGreaterThanOrEqual(6.9 * 24 * 60 * 60 * 1000);
            expect(ttlMs).toBeLessThanOrEqual(7.1 * 24 * 60 * 60 * 1000);
        });

        it('looks up the SHA-256 hash on refreshAccessToken and signs a new access token for a valid token', async () => {
            const rawToken = 'a'.repeat(96);
            const hashedToken = createHash('sha256').update(rawToken).digest('hex');
            prisma.refreshToken.findUnique.mockResolvedValue({
                id: 'rt-1',
                userId: baseUser.id,
                token: hashedToken,
                expiresAt: new Date(Date.now() + 3600_000),
                revokedAt: null,
                rotatedAt: null,
                user: { ...baseUser },
            });

            const result = await service.refreshAccessToken(rawToken);

            expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
                where: { token: hashedToken },
                include: { user: true },
            });
            expect(jwtService.sign).toHaveBeenCalledWith({ id: baseUser.id });
            expect(result).toEqual({
                accessToken: 'signed-access-jwt',
                refreshToken: expect.stringMatching(/^[a-f0-9]{96}$/),
            });
        });

        it('rejects unknown, revoked (non-rotated), expired, or inactive/deleted user refresh tokens with UnauthorizedException without issuing a token', async () => {
            prisma.refreshToken.findUnique.mockResolvedValueOnce(null);
            await expect(service.refreshAccessToken('unknown-token')).rejects.toThrow(
                new UnauthorizedException('Invalid refresh token'),
            );

            prisma.refreshToken.findUnique.mockResolvedValueOnce({
                id: 'rt-revoked',
                userId: baseUser.id,
                token: 'hash',
                expiresAt: new Date(Date.now() + 3600_000),
                revokedAt: new Date(),
                rotatedAt: null,
                user: { ...baseUser },
            });
            await expect(service.refreshAccessToken('revoked-token')).rejects.toThrow(
                new UnauthorizedException('Refresh token has been revoked'),
            );

            prisma.refreshToken.findUnique.mockResolvedValueOnce({
                id: 'rt-expired',
                userId: baseUser.id,
                token: 'hash',
                expiresAt: new Date(Date.now() - 1000),
                revokedAt: null,
                rotatedAt: null,
                user: { ...baseUser },
            });
            await expect(service.refreshAccessToken('expired-token')).rejects.toThrow(
                new UnauthorizedException('Refresh token has expired'),
            );

            prisma.refreshToken.findUnique.mockResolvedValueOnce({
                id: 'rt-inactive',
                userId: baseUser.id,
                token: 'hash',
                expiresAt: new Date(Date.now() + 3600_000),
                revokedAt: null,
                rotatedAt: null,
                user: { ...baseUser, isActive: false },
            });
            await expect(service.refreshAccessToken('inactive-user-token')).rejects.toThrow(
                new UnauthorizedException('User account is not active'),
            );

            prisma.refreshToken.findUnique.mockResolvedValueOnce({
                id: 'rt-deleted',
                userId: baseUser.id,
                token: 'hash',
                expiresAt: new Date(Date.now() + 3600_000),
                revokedAt: null,
                rotatedAt: null,
                user: { ...baseUser, isDeleted: true },
            });
            await expect(service.refreshAccessToken('deleted-user-token')).rejects.toThrow(
                new UnauthorizedException('User account is not active'),
            );

            expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
            expect(prisma.refreshToken.create).not.toHaveBeenCalled();
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('rejects logout-revoked tokens (rotatedAt null) both within 5s and after 1 hour with 401 "Refresh token has been revoked" without issuing a token or mass-revoking', async () => {
            const now = Date.now();
            const logoutTokenRecent = '1'.repeat(96);
            const logoutTokenOld = '2'.repeat(96);

            // Replayed 5 seconds after logout (inside the 30s rotation grace window, but rotatedAt is null)
            prisma.refreshToken.findUnique.mockResolvedValueOnce({
                id: 'rt-logout-5s',
                userId: baseUser.id,
                token: createHash('sha256').update(logoutTokenRecent).digest('hex'),
                expiresAt: new Date(now + 3600_000),
                revokedAt: new Date(now - 5_000),
                rotatedAt: null,
                user: { ...baseUser },
            });
            await expect(service.refreshAccessToken(logoutTokenRecent)).rejects.toThrow(
                new UnauthorizedException('Refresh token has been revoked'),
            );

            // Replayed 1 hour after logout
            prisma.refreshToken.findUnique.mockResolvedValueOnce({
                id: 'rt-logout-1h',
                userId: baseUser.id,
                token: createHash('sha256').update(logoutTokenOld).digest('hex'),
                expiresAt: new Date(now + 3600_000),
                revokedAt: new Date(now - 3600_000),
                rotatedAt: null,
                user: { ...baseUser },
            });
            await expect(service.refreshAccessToken(logoutTokenOld)).rejects.toThrow(
                new UnauthorizedException('Refresh token has been revoked'),
            );

            expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
            expect(prisma.refreshToken.create).not.toHaveBeenCalled();
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('rejects a password-change-revoked token (rotatedAt null) replayed later with 401 "Refresh token has been revoked" and leaves the user\'s other active tokens untouched', async () => {
            const staleDeviceToken = '3'.repeat(96);
            prisma.refreshToken.findUnique.mockResolvedValueOnce({
                id: 'rt-pw-change',
                userId: baseUser.id,
                token: createHash('sha256').update(staleDeviceToken).digest('hex'),
                expiresAt: new Date(Date.now() + 3600_000),
                revokedAt: new Date(Date.now() - 10 * 60_000), // revoked 10 minutes ago by password change
                rotatedAt: null,
                user: { ...baseUser },
            });

            await expect(service.refreshAccessToken(staleDeviceToken)).rejects.toThrow(
                new UnauthorizedException('Refresh token has been revoked'),
            );

            // Must NOT call revokeAllRefreshTokens (updateMany on userId), keeping fresh sessions alive
            expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
            expect(prisma.refreshToken.create).not.toHaveBeenCalled();
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it(
            'rotates the refresh token on refreshAccessToken by revoking the old token (setting both revokedAt and rotatedAt) and persisting a new hashed token',
            async () => {
                const rawToken = 'b'.repeat(96);
                const hashedToken = createHash('sha256').update(rawToken).digest('hex');
                prisma.refreshToken.findUnique.mockResolvedValue({
                    id: 'rt-rotate-1',
                    userId: baseUser.id,
                    token: hashedToken,
                    expiresAt: new Date(Date.now() + 3600_000),
                    revokedAt: null,
                    rotatedAt: null,
                    user: { ...baseUser },
                });

                const result = await service.refreshAccessToken(rawToken);

                expect(result.accessToken).toBe('signed-access-jwt');
                expect(result.refreshToken).toMatch(/^[a-f0-9]{96}$/);
                expect(result.refreshToken).not.toBe(rawToken);

                expect(prisma.refreshToken.updateMany).toHaveBeenCalledTimes(1);
                expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
                    where: { id: 'rt-rotate-1', revokedAt: null },
                    data: { revokedAt: expect.any(Date), rotatedAt: expect.any(Date) },
                });

                expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
                const createArg = prisma.refreshToken.create.mock.calls[0][0].data;
                const expectedNewHash = createHash('sha256').update(result.refreshToken).digest('hex');
                expect(createArg.userId).toBe(baseUser.id);
                expect(createArg.token).toBe(expectedNewHash);
                expect(createArg.token).not.toBe(result.refreshToken);
            },
        );

        it(
            'revokes all active refresh tokens for the user when a rotated refresh token is reused outside the grace window',
            async () => {
                const reusedToken = 'c'.repeat(96);
                const hashedToken = createHash('sha256').update(reusedToken).digest('hex');
                const rotatedAt = new Date(Date.now() - 60_000);
                prisma.refreshToken.findUnique.mockResolvedValue({
                    id: 'rt-reused',
                    userId: baseUser.id,
                    token: hashedToken,
                    expiresAt: new Date(Date.now() + 3600_000),
                    revokedAt: rotatedAt,
                    rotatedAt,
                    user: { ...baseUser },
                });

                await expect(service.refreshAccessToken(reusedToken)).rejects.toThrow(
                    new UnauthorizedException('Refresh token reuse detected'),
                );

                expect(prisma.refreshToken.updateMany).toHaveBeenCalledTimes(1);
                expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
                    where: { userId: baseUser.id, revokedAt: null },
                    data: { revokedAt: expect.any(Date) },
                });
                expect(prisma.refreshToken.create).not.toHaveBeenCalled();
                expect(jwtService.sign).not.toHaveBeenCalled();
            },
        );

        it('enforces the reuse grace-window boundary using rotatedAt (30s accepted without mass-revoke, 31s rejected with mass-revoke)', async () => {
            const fixedNow = new Date('2026-11-08T12:00:00.000Z');
            jest.useFakeTimers();
            jest.setSystemTime(fixedNow);

            try {
                const tokenAtBoundary = 'e'.repeat(96);
                const hashAtBoundary = createHash('sha256').update(tokenAtBoundary).digest('hex');
                const rotatedExactlyAtGrace = new Date(
                    fixedNow.getTime() - REFRESH_REUSE_GRACE_SECONDS * 1000,
                );

                prisma.refreshToken.findUnique.mockResolvedValueOnce({
                    id: 'rt-grace-30s',
                    userId: baseUser.id,
                    token: hashAtBoundary,
                    expiresAt: new Date(fixedNow.getTime() + 3600_000),
                    revokedAt: new Date(fixedNow.getTime() - 120_000),
                    rotatedAt: rotatedExactlyAtGrace,
                    user: { ...baseUser },
                });

                const withinGraceResult = await service.refreshAccessToken(tokenAtBoundary);

                expect(withinGraceResult.accessToken).toBe('signed-access-jwt');
                expect(withinGraceResult.refreshToken).toMatch(/^[a-f0-9]{96}$/);
                expect(withinGraceResult.refreshToken).not.toBe(tokenAtBoundary);
                // Must neither overwrite revokedAt/rotatedAt nor mass-revoke the user's tokens
                expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
                expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);

                prisma.refreshToken.create.mockClear();
                jwtService.sign.mockClear();

                const tokenPastBoundary = 'f'.repeat(96);
                const hashPastBoundary = createHash('sha256').update(tokenPastBoundary).digest('hex');
                const rotatedPastGrace = new Date(
                    fixedNow.getTime() - (REFRESH_REUSE_GRACE_SECONDS + 1) * 1000,
                );

                prisma.refreshToken.findUnique.mockResolvedValueOnce({
                    id: 'rt-grace-31s',
                    userId: baseUser.id,
                    token: hashPastBoundary,
                    expiresAt: new Date(fixedNow.getTime() + 3600_000),
                    revokedAt: fixedNow,
                    rotatedAt: rotatedPastGrace,
                    user: { ...baseUser },
                });

                await expect(service.refreshAccessToken(tokenPastBoundary)).rejects.toThrow(
                    new UnauthorizedException('Refresh token reuse detected'),
                );

                expect(prisma.refreshToken.updateMany).toHaveBeenCalledTimes(1);
                expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
                    where: { userId: baseUser.id, revokedAt: null },
                    data: { revokedAt: fixedNow },
                });
                expect(prisma.refreshToken.create).not.toHaveBeenCalled();
                expect(jwtService.sign).not.toHaveBeenCalled();
            } finally {
                jest.useRealTimers();
            }
        });

        it('accepts a concurrent rotation race when atomic updateMany returns count 0 and still issues rotated tokens', async () => {
            const rawToken = '9'.repeat(96);
            const hashedToken = createHash('sha256').update(rawToken).digest('hex');
            prisma.refreshToken.findUnique.mockResolvedValue({
                id: 'rt-race-0',
                userId: baseUser.id,
                token: hashedToken,
                expiresAt: new Date(Date.now() + 3600_000),
                revokedAt: null,
                rotatedAt: null,
                user: { ...baseUser },
            });
            prisma.refreshToken.updateMany.mockResolvedValueOnce({ count: 0 });

            const result = await service.refreshAccessToken(rawToken);

            expect(prisma.refreshToken.updateMany).toHaveBeenCalledTimes(1);
            expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
                where: { id: 'rt-race-0', revokedAt: null },
                data: { revokedAt: expect.any(Date), rotatedAt: expect.any(Date) },
            });
            expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                accessToken: 'signed-access-jwt',
                refreshToken: expect.stringMatching(/^[a-f0-9]{96}$/),
            });
        });

        it('revokes a single refresh token by SHA-256 hash on revokeRefreshToken', async () => {
            const rawToken = 'd'.repeat(96);
            const hashedToken = createHash('sha256').update(rawToken).digest('hex');

            await service.revokeRefreshToken(rawToken);

            expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
                where: { token: hashedToken, revokedAt: null },
                data: { revokedAt: expect.any(Date) },
            });
        });

        it('revokes all active refresh tokens for a user on revokeAllRefreshTokens', async () => {
            await service.revokeAllRefreshTokens(baseUser.id);

            expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
                where: { userId: baseUser.id, revokedAt: null },
                data: { revokedAt: expect.any(Date) },
            });
        });
    });
});
