import { z } from 'zod';
import {
    ServiceFormSchema,
    ServiceAdminSchema,
    ServiceSummaryWebSchema,
    ServiceDetailWebSchema,
    ServiceHighlightSchema,
    ServiceHighlightWebSchema,
} from '../validations/service.schema';

export type ServiceForm = z.infer<typeof ServiceFormSchema>;
export type ServiceFormModel = ServiceForm;
export type ServiceAdmin = z.infer<typeof ServiceAdminSchema>;
export type ServiceAdminModel = ServiceAdmin;
export type ServiceSummaryWeb = z.infer<typeof ServiceSummaryWebSchema>;
export type ServiceDetailWeb = z.infer<typeof ServiceDetailWebSchema>;
export type ServiceHighlight = z.infer<typeof ServiceHighlightSchema>;
export type ServiceHighlightWeb = z.infer<typeof ServiceHighlightWebSchema>;
