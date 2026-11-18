import {
    Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import {
    AdminAuthUserModel, CanResetPasswordModel, CanResetPasswordSchema,
    ChangeEmailModel, ChangeEmailSchema, ChangePasswordModel, ChangePasswordSchema,
    ChangeUsernameModel, ChangeUsernameSchema, CurrentUserModel, endpoint,
    ForgetPasswordModel, ForgetPasswordSchema, LoginModel, LoginSchema,
    ResetPasswordModel, ResetPasswordSchema, UpdateFullNameModel, UpdateFullNameSchema,
} from '@repo/shared';
import { CustomZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { getZodDto } from '@/common/swagger/zod-dto';
import { issueCsrfToken } from '@/common/csrf.middleware';
import { UsersService } from '@/users/users.service';
import { AuthService } from './auth.service';
import { authThrottle } from './auth-throttle';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthGuard } from './guards/auth.guard';

// Brute-force-sensitive: credential guessing (login) and OTP guessing (password reset).
const AUTH_THROTTLE = authThrottle();

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'lax' as const,
    get secure(): boolean {
        return process.env.NODE_ENV === 'production';
    },
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches AuthService's REFRESH_TOKEN_TTL_DAYS
};

@Controller()
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Public()
    @Get(endpoint.auth.csrfToken)
    getCsrfToken(@Req() req: Request, @Res() res: Response) {
        return issueCsrfToken(req, res);
    }

    @Public()
    @Throttle(AUTH_THROTTLE)
    @ApiBody({ type: getZodDto(LoginSchema) })
    @Post(endpoint.auth.login)
    async login(
        @Body(new CustomZodValidationPipe(LoginSchema)) data: LoginModel,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { accessToken, refreshToken } = await this.authService.login(data, req.ip ?? '', req.headers['user-agent']);
        res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, { ...REFRESH_TOKEN_COOKIE_OPTIONS });
        return { token: accessToken };
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post(endpoint.auth.refresh)
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = (req.cookies as Record<string, string> | undefined)?.[REFRESH_TOKEN_COOKIE];
        if (!refreshToken) {
            res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth' });
            throw new UnauthorizedException('No refresh token');
        }
        try {
            const { accessToken, refreshToken: rotatedRefreshToken } =
                await this.authService.refreshAccessToken(refreshToken);
            res.cookie(REFRESH_TOKEN_COOKIE, rotatedRefreshToken, { ...REFRESH_TOKEN_COOKIE_OPTIONS });
            return { token: accessToken };
        } catch (error) {
            res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth' });
            throw error;
        }
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post(endpoint.auth.logout)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = (req.cookies as Record<string, string> | undefined)?.[REFRESH_TOKEN_COOKIE];
        if (refreshToken) {
            await this.authService.revokeRefreshToken(refreshToken);
        }
        res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth' });
        return { message: 'Logged out successfully.' };
    }

    @UseGuards(AuthGuard)
    @Get(endpoint.auth.me)
    async getProfile(@CurrentUser() user: CurrentUserModel) {
        const userById = await this.authService.getUserViewModel(user.id);
        const data: AdminAuthUserModel = {
            id: userById.id,
            email: userById.email,
            fullName: userById.fullName,
            username: userById.username,
            premissions: userById.permissions as any,
        };
        return data;
    }

    @UseGuards(AuthGuard)
    @ApiBody({ type: getZodDto(ChangePasswordSchema) })
    @Post(endpoint.auth.changePassword)
    async changePassword(
        @CurrentUser() user: CurrentUserModel,
        @Body(new CustomZodValidationPipe(ChangePasswordSchema)) data: ChangePasswordModel,
    ) {
        await this.usersService.changePassword(user.id, data);
        await this.authService.revokeAllRefreshTokens(user.id);
        return { message: 'Password has been changed successfully.' };
    }

    @UseGuards(AuthGuard)
    @ApiBody({ type: getZodDto(UpdateFullNameSchema) })
    @Post(endpoint.auth.updateFullName)
    async updateFullName(
        @CurrentUser() user: CurrentUserModel,
        @Body(new CustomZodValidationPipe(UpdateFullNameSchema)) data: UpdateFullNameModel,
    ) {
        await this.usersService.updateFullName(user.id, data.fullName);
        return { message: 'Name updated successfully.' };
    }

    @UseGuards(AuthGuard)
    @ApiBody({ type: getZodDto(ChangeUsernameSchema) })
    @Post(endpoint.auth.changeUsername)
    async changeUsername(
        @CurrentUser() user: CurrentUserModel,
        @Body(new CustomZodValidationPipe(ChangeUsernameSchema)) data: ChangeUsernameModel,
    ) {
        await this.usersService.changeUsername(user.id, data);
        return { message: 'Username updated successfully.' };
    }

    @UseGuards(AuthGuard)
    @ApiBody({ type: getZodDto(ChangeEmailSchema) })
    @Post(endpoint.auth.changeEmail)
    async changeEmail(
        @CurrentUser() user: CurrentUserModel,
        @Body(new CustomZodValidationPipe(ChangeEmailSchema)) data: ChangeEmailModel,
    ) {
        await this.usersService.changeEmail(user.id, data);
        return { message: 'Email updated successfully.' };
    }

    @Public()
    @Throttle(AUTH_THROTTLE)
    @ApiBody({ type: getZodDto(ForgetPasswordSchema) })
    @Post(endpoint.auth.forgetPassword)
    async forgetPassword(@Body(new CustomZodValidationPipe(ForgetPasswordSchema)) data: ForgetPasswordModel) {
        await this.usersService.forgetPassword(data);
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    @Public()
    @Throttle(AUTH_THROTTLE)
    @ApiBody({ type: getZodDto(CanResetPasswordSchema) })
    @Post(endpoint.auth.canResetPassword)
    async canResetPassword(@Body(new CustomZodValidationPipe(CanResetPasswordSchema)) data: CanResetPasswordModel) {
        return await this.usersService.canResetPassword(data);
    }

    @Public()
    @Throttle(AUTH_THROTTLE)
    @ApiBody({ type: getZodDto(ResetPasswordSchema) })
    @Post(endpoint.auth.resetPassword)
    async resetPassword(
        @Body(new CustomZodValidationPipe(ResetPasswordSchema)) data: ResetPasswordModel,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.usersService.findByEmail(data.email);
        await this.usersService.resetPassword(data);
        await this.authService.revokeAllRefreshTokens(user.id);

        const { accessToken, refreshToken } = await this.authService.login(
            { email: data.email, password: data.newPassword },
            req.ip ?? '',
            req.headers['user-agent'],
        );
        res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

        return { token: accessToken, message: 'Password has been reset successfully.' };
    }
}
