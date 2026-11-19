import { HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class CustomZodValidationPipe<T = any> implements PipeTransform {
    // Accepts any zod schema (api, admin and @repo/shared all use zod 4).
    constructor(private readonly schema: z.ZodType) {}

    transform(value: unknown): T {
        if (value === undefined || value === null) {
            throw new HttpException(
                { statusCode: 400, message: 'Request body is required', errors: [] },
                HttpStatus.BAD_REQUEST,
            );
        }
        const result = this.schema.safeParse(value);
        if (!result.success) {
            const error = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
            throw new HttpException(
                { statusCode: 400, message: 'Validation failed', error },
                HttpStatus.BAD_REQUEST,
            );
        }
        return result.data as T;
    }
}
