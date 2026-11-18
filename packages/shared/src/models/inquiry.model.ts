import { z } from 'zod';
import { BookUnitFormSchema, InquiryFormSchema, InquiryQuerySchema } from '../validations';

export type InquiryFormModel = z.infer<typeof InquiryFormSchema>;
export type InquiryQueryModel = z.infer<typeof InquiryQuerySchema>;
export type BookUnitFormModel = z.infer<typeof BookUnitFormSchema>;

export type InquiryModel = InquiryFormModel & {
    id: string;
    createdAt: string;
    updatedAt: string;
    message?: string;
    preferredDate?: string;
    unitId?: string;
    projectName?: string;
    unitName?: string;
};
