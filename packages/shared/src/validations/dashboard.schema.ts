import { z } from 'zod';

const isValidIsoDate = (val: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:?\d{2})?)?$/.test(val)) {
        return false;
    }
    const parsed = Date.parse(val);
    return !isNaN(parsed);
};

export const LeadStatsQuerySchema = z
    .object({
        from: z
            .string()
            .optional()
            .nullable()
            .transform((val) => (val === '' || val === null ? undefined : val))
            .refine((val) => val === undefined || isValidIsoDate(val), {
                message: 'Invalid from date format',
            }),
        to: z
            .string()
            .optional()
            .nullable()
            .transform((val) => (val === '' || val === null ? undefined : val))
            .refine((val) => val === undefined || isValidIsoDate(val), {
                message: 'Invalid to date format',
            }),
    })
    .superRefine((data, ctx) => {
        let fromDate: Date | undefined;
        let toDate: Date | undefined;

        if (data.from && isValidIsoDate(data.from)) {
            fromDate = new Date(data.from);
        }
        if (data.to && isValidIsoDate(data.to)) {
            toDate = new Date(data.to);
        }

        if (fromDate && toDate) {
            if (fromDate.getTime() > toDate.getTime()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "'from' date must be before or equal to 'to' date",
                    path: ['from'],
                });
            }
            const diffDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays > 366) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Date range cannot exceed 366 days',
                    path: ['to'],
                });
            }
        } else if (fromDate && !toDate) {
            const now = new Date();
            const diffDays = (now.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays > 366) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Date range cannot exceed 366 days',
                    path: ['from'],
                });
            }
        }
    });

export const LeadStatsBySourceItemSchema = z.object({
    source: z.string(),
    count: z.number().int().nonnegative(),
});

export const LeadStatsByServiceItemSchema = z.object({
    serviceId: z.string().nullable().optional(),
    name: z.string(),
    count: z.number().int().nonnegative(),
});

export const LeadStatsByPathItemSchema = z.object({
    path: z.string(),
    count: z.number().int().nonnegative(),
});

export const EstimatorCompletionDailyItemSchema = z.object({
    date: z.string(),
    count: z.number().int().nonnegative(),
});

export const LeadStatsSchema = z.object({
    bySource: z.array(LeadStatsBySourceItemSchema),
    byService: z.array(LeadStatsByServiceItemSchema),
    byPath: z.array(LeadStatsByPathItemSchema),
    estimatorCompletions: z.array(EstimatorCompletionDailyItemSchema),
});

export type LeadStatsQueryModel = z.infer<typeof LeadStatsQuerySchema>;
export type LeadStatsModel = z.infer<typeof LeadStatsSchema>;
export type LeadStatsBySourceItem = z.infer<typeof LeadStatsBySourceItemSchema>;
export type LeadStatsByServiceItem = z.infer<typeof LeadStatsByServiceItemSchema>;
export type LeadStatsByPathItem = z.infer<typeof LeadStatsByPathItemSchema>;
export type EstimatorCompletionDailyItem = z.infer<typeof EstimatorCompletionDailyItemSchema>;
