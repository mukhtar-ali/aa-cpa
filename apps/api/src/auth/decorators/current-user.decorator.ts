import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserModel } from '@repo/shared';

export const CurrentUser = createParamDecorator(
    (_: unknown, ctx: ExecutionContext): CurrentUserModel => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
