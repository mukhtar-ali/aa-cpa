import { z } from 'zod';
import { PaginationParamsSchema } from './pagination.schema';
import { emailValidation, phoneValidation } from './base.schema';
import { fullNameValidation } from './admin.schema';

export const InquiryFormSchema = z.object({
    phone: phoneValidation,
    fullName: fullNameValidation,
    email: emailValidation,
    projectId: z.string().uuid('Invalid project ID').optional(),
    unitId: z.string().uuid('Invalid unit ID').optional(),
    message: z.string().optional(),
    preferredDate: z.string().optional(),
});

export const BookUnitFormSchema = z.object({
    fullName: fullNameValidation,
    phone: phoneValidation,
    email: emailValidation,
    message: z.string().optional(),
    preferredDate: z.string().optional(),
    unitId: z.string().uuid('Invalid unit ID').optional(),
    projectId: z.string().uuid('Invalid project ID').optional(),
});

export const InquiryQuerySchema = PaginationParamsSchema.extend({
    projectId: z.string().uuid().optional(),
});
