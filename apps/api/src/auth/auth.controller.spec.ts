import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type { NextFunction, Request, Response } from 'express';
import { csrfProtection, issueCsrfToken } from '@/common/csrf.middleware';
import { customEnv } from '@/config/custom-env';
import { UsersService } from '@/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

describe('AuthController, AuthGuard & CSRF Middleware', () => {
    let controller: AuthController;
    let authService: {
        login: jest.Mock;
        refreshAccessToken: jest.Mock;
        revokeRefreshToken: jest.Mock;
        revokeAllRefreshTokens: jest.Mock;
        getUserViewModel: jest.Mock;
    };
    let usersService: {
        changePassword: jest.Mock;
        findByEmail: jest.Mock;
        resetPassword: jest.Mock;
        getById: jest.Mock;
    };

    beforeAll(() => {
        if (!customEnv.CSRF_SECRET) {
            customEnv.CSRF_SECRET = 'unit-test-csrf-secret-key-at-least-32-chars';
        }
        if (!customEnv.JWT_SECRET) {
            customEnv.JWT_SECRET = 'unit-test-jwt-secret-key';
        }
    });

    beforeEach(async () => {
        authService = {
            login: jest.fn(),
            refreshAccessToken: jest.fn(),
            revokeRefreshToken: jest.fn(),
            revokeAllRefreshTokens: jest.fn(),
            getUserViewModel: jest.fn(),
        };

        usersService = {
            changePassword: jest.fn(),
            findByEmail: jest.fn(),
            resetPassword: jest.fn(),
            getById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: UsersService, useValue: usersService },
                { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
                Reflector,
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    describe('AuthController session and refresh-token endpoints', () => {
        it('sets httpOnly refreshToken cookie scoped to /api/auth on login and returns access token', async () => {
            authService.login.mockResolvedValue({
                accessToken: 'access-jwt-123',
                refreshToken: 'plain-refresh-token-abc',
            });

            const req = {
                ip: '127.0.0.1',
                headers: { 'user-agent': 'jest-test' },
            } as unknown as Request;
            const res = {
                cookie: jest.fn(),
            } as unknown as Response;

            const response = await controller.login(
                { email: 'admin@example.com', password: 'Password1!' },
                req,
                res,
            );

            expect(authService.login).toHaveBeenCalledWith(
                { email: 'admin@example.com', password: 'Password1!' },
                '127.0.0.1',
                'jest-test',
            );
            expect(res.cookie).toHaveBeenCalledWith(
                'refreshToken',
                'plain-refresh-token-abc',
                expect.objectContaining({
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/api/auth',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                }),
            );
            expect(response).toEqual({ token: 'access-jwt-123' });
        });

        it('clears the refreshToken cookie and throws UnauthorizedException when refresh is called without a cookie', async () => {
            const req = { cookies: {} } as unknown as Request;
            const res = { clearCookie: jest.fn() } as unknown as Response;

            await expect(controller.refresh(req, res)).rejects.toThrow(
                new UnauthorizedException('No refresh token'),
            );
            expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', { path: '/api/auth' });
            expect(authService.refreshAccessToken).not.toHaveBeenCalled();
        });

        it('returns only { token } and sets the rotated refreshToken cookie when refresh is called with a valid cookie', async () => {
            authService.refreshAccessToken.mockResolvedValue({
                accessToken: 'new-access-jwt',
                refreshToken: 'rotated-rt-value',
            });
            const req = { cookies: { refreshToken: 'valid-rt' } } as unknown as Request;
            const res = { clearCookie: jest.fn(), cookie: jest.fn() } as unknown as Response;

            const result = await controller.refresh(req, res);

            expect(authService.refreshAccessToken).toHaveBeenCalledWith('valid-rt');
            expect(result).toEqual({ token: 'new-access-jwt' });
            expect(Object.keys(result)).toEqual(['token']);
        });

        it('sets a new rotated refreshToken cookie on POST /api/auth/refresh with httpOnly/sameSite/path/secure options (production vs non-production)', async () => {
            const originalNodeEnv = process.env.NODE_ENV;
            try {
                process.env.NODE_ENV = 'development';
                authService.refreshAccessToken.mockResolvedValueOnce({
                    accessToken: 'new-access-jwt-dev',
                    refreshToken: 'rotated-refresh-token-dev',
                });
                const reqDev = { cookies: { refreshToken: 'old-refresh-token' } } as unknown as Request;
                const resDev = { clearCookie: jest.fn(), cookie: jest.fn() } as unknown as Response;

                const bodyDev = await controller.refresh(reqDev, resDev);

                expect(bodyDev).toEqual({ token: 'new-access-jwt-dev' });
                expect(resDev.cookie).toHaveBeenCalledWith('refreshToken', 'rotated-refresh-token-dev', {
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: false,
                    path: '/api/auth',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });

                process.env.NODE_ENV = 'production';
                authService.refreshAccessToken.mockResolvedValueOnce({
                    accessToken: 'new-access-jwt-prod',
                    refreshToken: 'rotated-refresh-token-prod',
                });
                const reqProd = { cookies: { refreshToken: 'old-refresh-token' } } as unknown as Request;
                const resProd = { clearCookie: jest.fn(), cookie: jest.fn() } as unknown as Response;

                const bodyProd = await controller.refresh(reqProd, resProd);

                expect(bodyProd).toEqual({ token: 'new-access-jwt-prod' });
                expect(resProd.cookie).toHaveBeenCalledWith('refreshToken', 'rotated-refresh-token-prod', {
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: true,
                    path: '/api/auth',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
            } finally {
                process.env.NODE_ENV = originalNodeEnv;
            }
        });

        it('clears the refreshToken cookie with path /api/auth and rethrows when refreshAccessToken throws', async () => {
            authService.refreshAccessToken.mockRejectedValueOnce(
                new UnauthorizedException('Refresh token reuse detected'),
            );
            const req = { cookies: { refreshToken: 'reused-refresh-token' } } as unknown as Request;
            const res = { clearCookie: jest.fn(), cookie: jest.fn() } as unknown as Response;

            await expect(controller.refresh(req, res)).rejects.toThrow(
                new UnauthorizedException('Refresh token reuse detected'),
            );

            expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', { path: '/api/auth' });
            expect(res.cookie).not.toHaveBeenCalled();
        });

        it('revokes the refresh token and clears the cookie on logout', async () => {
            const req = { cookies: { refreshToken: 'active-rt' } } as unknown as Request;
            const res = { clearCookie: jest.fn() } as unknown as Response;

            const result = await controller.logout(req, res);

            expect(authService.revokeRefreshToken).toHaveBeenCalledWith('active-rt');
            expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', { path: '/api/auth' });
            expect(result).toEqual({ message: 'Logged out successfully.' });
        });
    });

    describe('Revoke-all refresh tokens on password change and reset', () => {
        it('revokes all refresh tokens for the user after changing password', async () => {
            usersService.changePassword.mockResolvedValue(undefined);
            authService.revokeAllRefreshTokens.mockResolvedValue(undefined);

            const dto = {
                oldPassword: 'OldPassword1!',
                newPassword: 'NewPassword1!',
                passwordConfirmation: 'NewPassword1!',
            };
            const result = await controller.changePassword(
                { id: 'user-123', permissions: [] },
                dto,
            );

            expect(usersService.changePassword).toHaveBeenCalledWith('user-123', dto);
            expect(authService.revokeAllRefreshTokens).toHaveBeenCalledWith('user-123');
            expect(result).toEqual({ message: 'Password has been changed successfully.' });
        });

        it('does not revoke refresh tokens if changePassword fails validation', async () => {
            usersService.changePassword.mockRejectedValue(new Error('Old password is incorrect'));

            await expect(
                controller.changePassword(
                    { id: 'user-123', permissions: [] },
                    {
                        oldPassword: 'wrong',
                        newPassword: 'NewPassword1!',
                        passwordConfirmation: 'NewPassword1!',
                    },
                ),
            ).rejects.toThrow('Old password is incorrect');

            expect(authService.revokeAllRefreshTokens).not.toHaveBeenCalled();
        });

        it('revokes all existing refresh tokens on password reset before issuing a new session', async () => {
            const callOrder: string[] = [];
            usersService.findByEmail.mockResolvedValue({ id: 'user-456', email: 'user@example.com' });
            usersService.resetPassword.mockImplementation(async () => {
                callOrder.push('resetPassword');
            });
            authService.revokeAllRefreshTokens.mockImplementation(async () => {
                callOrder.push('revokeAllRefreshTokens');
            });
            authService.login.mockImplementation(async () => {
                callOrder.push('login');
                return { accessToken: 'post-reset-jwt', refreshToken: 'post-reset-rt' };
            });

            const req = {
                ip: '127.0.0.1',
                headers: { 'user-agent': 'jest-reset' },
            } as unknown as Request;
            const res = { cookie: jest.fn() } as unknown as Response;
            const dto = {
                email: 'user@example.com',
                otp: '123456',
                newPassword: 'ResetPassword1!',
                passwordConfirmation: 'ResetPassword1!',
            };

            const result = await controller.resetPassword(dto, req, res);

            expect(usersService.findByEmail).toHaveBeenCalledWith('user@example.com');
            expect(usersService.resetPassword).toHaveBeenCalledWith(dto);
            expect(authService.revokeAllRefreshTokens).toHaveBeenCalledWith('user-456');
            expect(callOrder).toEqual(['resetPassword', 'revokeAllRefreshTokens', 'login']);
            expect(res.cookie).toHaveBeenCalledWith(
                'refreshToken',
                'post-reset-rt',
                expect.objectContaining({ httpOnly: true, path: '/api/auth' }),
            );
            expect(result).toEqual({
                token: 'post-reset-jwt',
                message: 'Password has been reset successfully.',
            });
        });
    });

    describe('CSRF protection middleware (scoped to /api/auth/refresh and /api/auth/logout)', () => {
        function createMockReqRes(overrides: Partial<Request> = {}) {
            const cookiesSet: Record<string, string> = {};
            const cookieOptions: Record<string, Record<string, unknown>> = {};
            const req = {
                method: 'POST',
                url: '/api/auth/refresh',
                ip: '192.168.1.10',
                headers: { 'user-agent': 'jest-csrf-agent' },
                cookies: {},
                ...overrides,
            } as unknown as Request;

            const res = {
                cookie: jest.fn((name: string, val: string, options?: Record<string, unknown>) => {
                    cookiesSet[name] = val;
                    cookieOptions[name] = options ?? {};
                    return res;
                }),
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            } as unknown as Response;

            const next: NextFunction = jest.fn();
            return { req, res, next, cookiesSet, cookieOptions };
        }

        it('rejects POST /api/auth/refresh when CSRF token cookie and header are missing', () => {
            const { req, res, next } = createMockReqRes({ url: '/api/auth/refresh' });

            csrfProtection(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                statusCode: 403,
                message: 'CSRF validation failed. Please refresh and try again.',
                code: 'CSRF_INVALID_TOKEN',
            });
        });

        it('rejects POST /api/auth/logout when CSRF header is missing or mismatched', () => {
            // Issue a real CSRF cookie first, then omit or tamper with the x-csrf-token header
            const issueCtx = createMockReqRes({ method: 'GET', url: '/api/auth/csrf-token' });
            issueCsrfToken(issueCtx.req, issueCtx.res);
            const csrfCookieValue = issueCtx.cookiesSet['x-csrf-token'];
            expect(csrfCookieValue).toBeDefined();

            const { req, res, next } = createMockReqRes({
                url: '/api/auth/logout',
                cookies: { 'x-csrf-token': csrfCookieValue, csrf_sid: issueCtx.cookiesSet['csrf_sid'] },
                headers: {
                    'user-agent': 'jest-csrf-agent',
                    'x-csrf-token': 'forged-csrf-token',
                },
            });

            csrfProtection(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 403,
                    code: 'CSRF_INVALID_TOKEN',
                }),
            );
        });

        it('allows POST /api/auth/refresh and /api/auth/logout when a valid CSRF cookie + x-csrf-token header pair is provided', () => {
            const issueCtx = createMockReqRes({ method: 'GET', url: '/api/auth/csrf-token' });
            issueCsrfToken(issueCtx.req, issueCtx.res);

            const csrfCookieValue = issueCtx.cookiesSet['x-csrf-token'];
            const issuedBody = (issueCtx.res.json as jest.Mock).mock.calls[0][0] as { csrfToken: string };

            const { req, res, next } = createMockReqRes({
                method: 'POST',
                url: '/api/auth/refresh',
                cookies: { 'x-csrf-token': csrfCookieValue, csrf_sid: issueCtx.cookiesSet['csrf_sid'] },
                headers: {
                    'user-agent': 'jest-csrf-agent',
                    'x-csrf-token': issuedBody.csrfToken,
                },
            });

            csrfProtection(req, res, next);

            expect(res.status).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(undefined);
        });

        // --- MUK-466: logout used to fail with 403 CSRF_INVALID_TOKEN ---------------------------
        describe('session-cookie binding (MUK-466)', () => {
            function issue(sidCookie?: string) {
                const ctx = createMockReqRes({
                    method: 'GET',
                    url: '/api/auth/csrf-token',
                    cookies: sidCookie ? { csrf_sid: sidCookie } : {},
                });
                issueCsrfToken(ctx.req, ctx.res);
                const body = (ctx.res.json as jest.Mock).mock.calls[0][0] as { csrfToken: string };
                return { ...ctx, token: body.csrfToken };
            }

            function post(url: string, cookies: Record<string, string>, headers: Record<string, string>) {
                const ctx = createMockReqRes({ method: 'POST', url, cookies, headers });
                csrfProtection(ctx.req, ctx.res, ctx.next);
                return ctx;
            }

            it('accepts POST /api/auth/logout that carries a Bearer Authorization header, using a token issued WITHOUT one (the broken case)', () => {
                const issued = issue(); // the admin fetches the token with no Authorization header

                const { res, next } = post(
                    '/api/auth/logout',
                    { 'x-csrf-token': issued.cookiesSet['x-csrf-token'], csrf_sid: issued.cookiesSet['csrf_sid'] },
                    {
                        'user-agent': 'jest-csrf-agent',
                        authorization: 'Bearer some.access.token', // the logout request adds this
                        'x-csrf-token': issued.token,
                    },
                );

                expect(res.status).not.toHaveBeenCalled();
                expect(next).toHaveBeenCalledWith(undefined);
            });

            it('still accepts the token when the access token changes (silent refresh) or the client IP / User-Agent changes', () => {
                const issued = issue();
                const cookies = { 'x-csrf-token': issued.cookiesSet['x-csrf-token'], csrf_sid: issued.cookiesSet['csrf_sid'] };

                for (const auth of ['Bearer first.token', 'Bearer a.completely.new.token', undefined]) {
                    const ctx = createMockReqRes({
                        method: 'POST',
                        url: '/api/auth/logout',
                        ip: '203.0.113.99', // different from the issuing request
                        cookies,
                        headers: {
                            'user-agent': 'a-different-user-agent',
                            ...(auth ? { authorization: auth } : {}),
                            'x-csrf-token': issued.token,
                        },
                    });
                    csrfProtection(ctx.req, ctx.res, ctx.next);
                    expect(ctx.res.status).not.toHaveBeenCalled();
                    expect(ctx.next).toHaveBeenCalledWith(undefined);
                }
            });

            it('rejects the request when the session cookie is missing (the token is bound to it)', () => {
                const issued = issue();
                const { res, next } = post(
                    '/api/auth/logout',
                    { 'x-csrf-token': issued.cookiesSet['x-csrf-token'] },
                    { 'x-csrf-token': issued.token },
                );
                expect(next).not.toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(403);
            });

            it("rejects a token that belongs to another browser's session (different csrf_sid)", () => {
                const a = issue();
                const b = issue();
                expect(a.cookiesSet['csrf_sid']).not.toBe(b.cookiesSet['csrf_sid']);

                const { res, next } = post(
                    '/api/auth/logout',
                    { 'x-csrf-token': a.cookiesSet['x-csrf-token'], csrf_sid: b.cookiesSet['csrf_sid'] },
                    { 'x-csrf-token': a.token },
                );
                expect(next).not.toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(403);
            });

            it('rejects a malformed session cookie even if a token was minted for that literal value', () => {
                const issued = issue('short'); // 'short' is not a valid 43-char id, so it is replaced
                expect(issued.cookiesSet['csrf_sid']).toMatch(/^[A-Za-z0-9_-]{43}$/);
                expect(issued.cookiesSet['csrf_sid']).not.toBe('short');
            });

            it('sets the session cookie httpOnly / sameSite=lax / path=/ with a 30-day lifetime when the browser has none', () => {
                const issued = issue();
                expect(issued.cookieOptions['csrf_sid']).toEqual(
                    expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/', maxAge: 30 * 24 * 60 * 60 * 1000 }),
                );
            });

            it('reuses a valid existing session cookie instead of issuing a new one', () => {
                const first = issue();
                const sid = first.cookiesSet['csrf_sid'];
                const again = issue(sid);
                expect(again.cookiesSet['csrf_sid']).toBeUndefined(); // no new session cookie was set
                // and a token generated for it validates with that same session
                const { res, next } = post(
                    '/api/auth/logout',
                    { 'x-csrf-token': again.cookiesSet['x-csrf-token'], csrf_sid: sid },
                    { 'x-csrf-token': again.token },
                );
                expect(res.status).not.toHaveBeenCalled();
                expect(next).toHaveBeenCalledWith(undefined);
            });

            it('replaces a stale csrf cookie that no longer validates (e.g. issued under the old identifier scheme)', () => {
                const old = issue();
                const fresh = createMockReqRes({
                    method: 'GET',
                    url: '/api/auth/csrf-token',
                    // an existing browser: has a token cookie, but no (or a different) session cookie
                    cookies: { 'x-csrf-token': old.cookiesSet['x-csrf-token'] },
                });
                issueCsrfToken(fresh.req, fresh.res);
                const body = (fresh.res.json as jest.Mock).mock.calls[0][0] as { csrfToken: string };

                expect(body.csrfToken).not.toBe(old.token);
                const { res, next } = post(
                    '/api/auth/logout',
                    { 'x-csrf-token': fresh.cookiesSet['x-csrf-token'], csrf_sid: fresh.cookiesSet['csrf_sid'] },
                    { 'x-csrf-token': body.csrfToken },
                );
                expect(res.status).not.toHaveBeenCalled();
                expect(next).toHaveBeenCalledWith(undefined);
            });
        });
    });

    describe('AuthGuard', () => {
        let guard: AuthGuard;
        let jwtService: { verifyAsync: jest.Mock };
        let reflector: Reflector;

        beforeEach(() => {
            jwtService = { verifyAsync: jest.fn() };
            reflector = new Reflector();
            guard = new AuthGuard(jwtService as unknown as JwtService, reflector, usersService as unknown as UsersService);
        });

        function createExecutionContext(headers: Record<string, string> = {}): ExecutionContext {
            const request = { headers, user: undefined };
            return {
                getHandler: () => ({}),
                getClass: () => ({}),
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as unknown as ExecutionContext;
        }

        it('rejects requests without a Bearer token with UnauthorizedException', async () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
            const ctx = createExecutionContext({});

            await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
        });

        it(' verifies Bearer token and attaches user id and permissions to request', async () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
            jwtService.verifyAsync.mockResolvedValue({ id: 'user-789' });
            usersService.getById.mockResolvedValue({
                id: 'user-789',
                permissions: ['AdminPortalCareersView'],
                isActive: true,
                isDeleted: false,
            });

            const ctx = createExecutionContext({ authorization: 'Bearer valid-jwt' });
            await expect(guard.canActivate(ctx)).resolves.toBe(true);

            const req = ctx.switchToHttp().getRequest() as { user: unknown };
            expect(req.user).toEqual({
                id: 'user-789',
                permissions: ['AdminPortalCareersView'],
            });
        });

        it.each([
            ['deactivated (isActive=false)', { isActive: false, isDeleted: false }],
            ['soft-deleted (isDeleted=true)', { isActive: true, isDeleted: true }],
            ['deleted and deactivated', { isActive: false, isDeleted: true }],
        ])('rejects a valid JWT for a %s account (MUK-465)', async (_label, flags) => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
            jwtService.verifyAsync.mockResolvedValue({ id: 'user-789' });
            usersService.getById.mockResolvedValue({ id: 'user-789', permissions: ['AdminPortalCareersView'], ...flags });

            const ctx = createExecutionContext({ authorization: 'Bearer valid-jwt' });
            await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
            expect((ctx.switchToHttp().getRequest() as { user: unknown }).user).toBeUndefined();
        });

        it('rejects a valid JWT whose user no longer exists', async () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
            jwtService.verifyAsync.mockResolvedValue({ id: 'ghost' });
            usersService.getById.mockRejectedValue(new Error('User not found'));

            const ctx = createExecutionContext({ authorization: 'Bearer valid-jwt' });
            await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
        });
    });
});
