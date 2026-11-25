import { z } from 'zod';
import { PaginationParamsSchema } from './pagination.schema';

export function normalizeFromPath(input: string): string {
    if (!input || typeof input !== 'string') return '';
    let val = input.trim();
    if (val.startsWith('http://') || val.startsWith('https://')) {
        try {
            const parsed = new URL(val);
            val = parsed.pathname;
        } catch {
            // fallback
        }
    }
    const beforeQuery = val.split('?')[0] ?? '';
    val = (beforeQuery.split('#')[0] ?? '').trim();
    if (!val.startsWith('/')) {
        val = '/' + val;
    }
    if (val.length > 1 && val.endsWith('/')) {
        val = val.replace(/\/+$/, '');
    }
    return val.toLowerCase();
}

export function normalizeToPath(input: string): string {
    if (!input || typeof input !== 'string') return '';
    let val = input.trim();
    if (val.startsWith('http://') || val.startsWith('https://')) {
        return val;
    }
    if (!val.startsWith('/')) {
        val = '/' + val;
    }
    if (val.length > 1 && val.endsWith('/')) {
        val = val.replace(/\/+$/, '');
    }
    return val;
}

export const RedirectTypeSchema = z.enum(['permanent', 'temporary']);
export type RedirectType = z.infer<typeof RedirectTypeSchema>;

export const RedirectSourceSchema = z.enum(['manual', 'legacy_import', 'slug_change']);
export type RedirectSource = z.infer<typeof RedirectSourceSchema>;

export const RedirectFormSchema = z
    .object({
        fromPath: z
            .string()
            .min(1, 'fromPath is required')
            .max(500, 'fromPath must not exceed 500 characters')
            .transform(normalizeFromPath),
        toPath: z
            .string()
            .min(1, 'toPath is required')
            .max(500, 'toPath must not exceed 500 characters')
            .transform(normalizeToPath),
        type: RedirectTypeSchema.default('permanent'),
        source: RedirectSourceSchema.optional().default('manual'),
    })
    .refine((data) => data.fromPath !== data.toPath, {
        message: 'toPath must not equal fromPath',
        path: ['toPath'],
    });

export const RedirectAdminSchema = z.object({
    id: z.string(),
    fromPath: z.string(),
    toPath: z.string(),
    type: RedirectTypeSchema,
    source: RedirectSourceSchema,
    hits: z.number().int().default(0),
    lastHitAt: z.union([z.string(), z.date()]).nullable().optional(),
    createdById: z.string().nullable().optional(),
    createdBy: z
        .object({
            id: z.string(),
            fullName: z.string(),
            email: z.string(),
        })
        .nullable()
        .optional(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});

export const RedirectImportRowSchema = z
    .object({
        from: z
            .string()
            .min(1, 'from is required')
            .max(500, 'from must not exceed 500 characters')
            .transform(normalizeFromPath),
        to: z
            .string()
            .min(1, 'to is required')
            .max(500, 'to must not exceed 500 characters')
            .transform(normalizeToPath),
        type: z
            .preprocess((val) => {
                if (typeof val === 'string') {
                    const lower = val.trim().toLowerCase();
                    if (lower === '308' || lower === '301' || lower === 'permanent') return 'permanent';
                    if (lower === '307' || lower === '302' || lower === 'temporary') return 'temporary';
                }
                return val;
            }, RedirectTypeSchema)
            .default('permanent'),
    })
    .refine((data) => data.from !== data.to, {
        message: 'to must not equal from',
        path: ['to'],
    });

export const RedirectMapWebSchema = z.record(
    z.string(),
    z.object({
        to: z.string(),
        type: RedirectTypeSchema,
    }),
);

export const RedirectFilterSchema = PaginationParamsSchema.extend({
    source: RedirectSourceSchema.optional(),
    type: RedirectTypeSchema.optional(),
});

export const RedirectListAdminSchema = z.object({
    items: z.array(RedirectAdminSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
});
