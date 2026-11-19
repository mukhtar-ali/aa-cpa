import { z } from 'zod';
import { emailValidation } from './base.schema';

export const NotificationSettingsSchema = z.object({
    defaultInbox: emailValidation.optional().default('info@cpa.sa'),
    serviceRecipients: z.record(z.string(), z.array(emailValidation)).default({}),
    careersInbox: emailValidation.optional().default('careers@cpa.sa'),
    contactRecipients: z.array(emailValidation).optional(),
    quoteRecipients: z.array(emailValidation).optional(),
    applicationRecipients: z.array(emailValidation).optional(),
    retentionMonths: z.number().int().min(1).default(12),
});

export const SpamSettingsSchema = z.object({
    turnstileEnabled: z.boolean().default(false),
    turnstileSiteKey: z.string().optional().or(z.literal('')),
    minFillSeconds: z.number().int().min(0).default(3),
    minSubmitSeconds: z.number().int().min(0).optional(),
});
