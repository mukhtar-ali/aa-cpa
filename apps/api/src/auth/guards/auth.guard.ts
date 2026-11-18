import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { customEnv } from '@/config/custom-env';
import { JwtPayloadModel } from '@repo/shared';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private readonly usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException();

        try {
            const payload: JwtPayloadModel = await this.jwtService.verifyAsync(token, {
                secret: customEnv.JWT_SECRET,
            });
            const user = await this.usersService.getById(payload.id);
            // Access tokens live for 24 h, so a deactivated or soft-deleted account must be rejected
            // here on every request, not only when it next logs in or refreshes.
            if (!user.isActive || user.isDeleted) throw new UnauthorizedException();
            request.user = { id: payload.id, permissions: user.permissions };
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
