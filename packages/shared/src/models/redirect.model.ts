import { z } from 'zod';
import {
    RedirectFormSchema,
    RedirectAdminSchema,
    RedirectImportRowSchema,
    RedirectMapWebSchema,
    RedirectFilterSchema,
    RedirectListAdminSchema,
} from '../validations/redirect.schema';

export type RedirectForm = z.infer<typeof RedirectFormSchema>;
export type RedirectFormModel = RedirectForm;
export type RedirectAdmin = z.infer<typeof RedirectAdminSchema>;
export type RedirectAdminModel = RedirectAdmin;
export type RedirectImportRow = z.infer<typeof RedirectImportRowSchema>;
export type RedirectMapWeb = z.infer<typeof RedirectMapWebSchema>;
export type RedirectFilter = z.infer<typeof RedirectFilterSchema>;
export type RedirectListAdmin = z.infer<typeof RedirectListAdminSchema>;
