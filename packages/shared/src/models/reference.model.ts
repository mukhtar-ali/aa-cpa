import { z } from 'zod';
import {
    ClientLogoAdminSchema,
    ClientLogoFormSchema,
    ClientLogoWebSchema,
    CredentialAdminSchema,
    CredentialFormSchema,
    CredentialWebSchema,
    FaqItemAdminSchema,
    FaqItemFormSchema,
    FaqItemWebSchema,
    FaqScopeEnum,
    LogoItemWebSchema,
    OfficeAdminSchema,
    OfficeCoordinatesSchema,
    OfficeFormSchema,
    OfficeWebSchema,
    TestimonialAdminSchema,
    TestimonialFormSchema,
    TestimonialWebSchema,
} from '../validations/reference.schema';

export type OfficeCoordinates = z.infer<typeof OfficeCoordinatesSchema>;
export type OfficeForm = z.infer<typeof OfficeFormSchema>;
export type OfficeAdmin = z.infer<typeof OfficeAdminSchema>;
export type OfficeWeb = z.infer<typeof OfficeWebSchema>;

export type TestimonialForm = z.infer<typeof TestimonialFormSchema>;
export type TestimonialAdmin = z.infer<typeof TestimonialAdminSchema>;
export type TestimonialWeb = z.infer<typeof TestimonialWebSchema>;

export type ClientLogoForm = z.infer<typeof ClientLogoFormSchema>;
export type ClientLogoAdmin = z.infer<typeof ClientLogoAdminSchema>;
export type ClientLogoWeb = z.infer<typeof ClientLogoWebSchema>;
export type LogoItemWeb = z.infer<typeof LogoItemWebSchema>;

export type CredentialForm = z.infer<typeof CredentialFormSchema>;
export type CredentialAdmin = z.infer<typeof CredentialAdminSchema>;
export type CredentialWeb = z.infer<typeof CredentialWebSchema>;

export type FaqScope = z.infer<typeof FaqScopeEnum>;
export type FaqItemForm = z.infer<typeof FaqItemFormSchema>;
export type FaqItemAdmin = z.infer<typeof FaqItemAdminSchema>;
export type FaqItemWeb = z.infer<typeof FaqItemWebSchema>;
