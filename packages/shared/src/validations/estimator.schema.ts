import { z } from 'zod';
import {
    MultiLanguageFieldSchema,
    PublicFormGuardSchema,
    SaudiMobileSchema,
} from './common.schema';
import { emailValidation } from './base.schema';

export const EstimatorOptionSchema = z.object({
    id: z.string(),
    label: MultiLanguageFieldSchema,
    value: z.union([z.string(), z.number()]),
    factor: z.number().optional(),
});

export const EstimatorQuestionSchema = z.object({
    id: z.string(),
    title: MultiLanguageFieldSchema,
    subtitle: MultiLanguageFieldSchema.optional(),
    type: z.enum(['select', 'radio', 'number']),
    options: z.array(EstimatorOptionSchema).default([]),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    unit: MultiLanguageFieldSchema.optional(),
});

export const EstimatorPricingRulesSchema = z.object({
    serviceBases: z.record(z.string(), z.number()).default({}),
    revenueBands: z
        .array(
            z.object({
                maxRevenue: z.number(),
                factor: z.number(),
            }),
        )
        .default([]),
    entityFactors: z.record(z.string(), z.number()).default({}),
    booksFactors: z.record(z.string(), z.number()).default({}),
});

export const EstimatorConfigSchema = z.object({
    status: z.enum(['draft', 'approved']).default('draft'),
    currency: z.string().default('SAR'),
    spreadPercent: z.number().default(15),
    roundingTo: z.number().default(500),
    disclaimer: MultiLanguageFieldSchema,
    labels: z.record(z.string(), MultiLanguageFieldSchema).optional(),
    questions: z.array(EstimatorQuestionSchema).default([]),
    pricing: EstimatorPricingRulesSchema.optional(),
});

export const EstimatorOptionWebSchema = z.object({
    id: z.string(),
    label: z.string(),
    value: z.union([z.string(), z.number()]),
});

export const EstimatorQuestionWebSchema = z.object({
    id: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    type: z.enum(['select', 'radio', 'number']),
    options: z.array(EstimatorOptionWebSchema).default([]),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    unit: z.string().optional(),
});

export const EstimatorPublicSchema = z.object({
    currency: z.string(),
    disclaimer: z.string(),
    questions: z.array(EstimatorQuestionWebSchema),
    labels: z.record(z.string(), z.string()).optional(),
});

export const EstimateRequestSchema = z.object({
    answers: z.record(z.string(), z.union([z.string(), z.number()])),
});

export const EstimateResponseSchema = z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string().default('SAR'),
    disclaimer: z.string(),
    isDraft: z.boolean().optional(),
});

export const QuoteRequestSchema = PublicFormGuardSchema.extend({
    answers: z.record(z.string(), z.union([z.string(), z.number()])),
    range: z.object({
        min: z.number(),
        max: z.number(),
        currency: z.string().default('SAR'),
    }),
    fullName: z.string().min(1, 'Full name is required').max(100),
    company: z.string().max(150).optional().or(z.literal('')),
    mobile: SaudiMobileSchema,
    email: emailValidation,
    landingPath: z.string().max(500).optional().or(z.literal('')),
});
