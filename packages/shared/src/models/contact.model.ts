import { z } from 'zod';
import { ContactFormSchema, ContactQuerySchema, ContactStatusSchema, ContactUsFormSchema, ContactUsHeroSchema } from '../validations/contact.schema';
import { Localized } from '../utils/localized.type';

export interface IContactModel {
    id: string;
    fullName: string;
    subject: string;
    email: string;
    department: string;
    message: string;
    status: string;
}

export type ContactQueryModel = z.infer<typeof ContactQuerySchema>;
export type ContactStatusModel = z.infer<typeof ContactStatusSchema>;
export type ContactModel = IContactModel & { id: string; createdAt: string; updatedAt: string };
export type ContactHeroSectionModel = z.infer<typeof ContactUsHeroSchema>;
export type ContactFormSectionModel = z.infer<typeof ContactUsFormSchema>;
export type ContactFormModel = z.infer<typeof ContactFormSchema>;
export type ContactHeroSectionModelWeb = Localized<ContactHeroSectionModel>;
export type ContactFormSectionModelWeb = Localized<ContactFormSectionModel>;
