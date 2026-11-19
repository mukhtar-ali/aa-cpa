import { z } from 'zod';

export const PaginationParamsSchema = z.object({
    pageNumber: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    search: z.string().optional(),
});

/**
 * Boolean query parameter. `z.coerce.boolean()` is wrong for query strings: Boolean("false") is true, so
 * `?isPublished=false` (the Draft filter) would have returned the PUBLISHED rows. Only the strings
 * "true"/"false" (and real booleans) are accepted; anything else fails validation.
 */
export const queryBoolean = z.preprocess(
    (value) => (value === 'true' ? true : value === 'false' ? false : value),
    z.boolean().optional(),
);

/**
 * Multi-value query parameter sent as a comma-separated list (`?status=new,closed`) and validated against
 * `item`. A single value (`?status=new`) is accepted too. Parses to an array, or undefined when absent/empty.
 */
export const csvList = <T extends z.ZodType>(item: T) =>
    z.preprocess((value) => {
        if (typeof value !== 'string') return value;
        const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
        return parts.length > 0 ? parts : undefined;
    }, z.array(item).optional());
