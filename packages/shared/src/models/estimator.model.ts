import { z } from 'zod';
import {
    EstimateRequestSchema,
    EstimateResponseSchema,
    EstimatorConfigSchema,
    EstimatorOptionSchema,
    EstimatorOptionWebSchema,
    EstimatorPricingRulesSchema,
    EstimatorPublicSchema,
    EstimatorQuestionSchema,
    EstimatorQuestionWebSchema,
    QuoteRequestSchema,
} from '../validations/estimator.schema';

export type EstimatorOption = z.infer<typeof EstimatorOptionSchema>;
export type EstimatorQuestion = z.infer<typeof EstimatorQuestionSchema>;
export type EstimatorPricingRules = z.infer<typeof EstimatorPricingRulesSchema>;
export type EstimatorConfig = z.infer<typeof EstimatorConfigSchema>;

export type EstimatorOptionWeb = z.infer<typeof EstimatorOptionWebSchema>;
export type EstimatorQuestionWeb = z.infer<typeof EstimatorQuestionWebSchema>;
export type EstimatorPublic = z.infer<typeof EstimatorPublicSchema>;

export type EstimateRequest = z.infer<typeof EstimateRequestSchema>;
export type EstimateResponse = z.infer<typeof EstimateResponseSchema>;
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
