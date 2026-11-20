import { z } from 'zod';
import {
    ContactRequestSchema,
    ConsentRecordSummarySchema,
    ContactUsFormSchema,
    ContactUsHeroSchema,
    LeadAdminSchema,
    LeadNoteSchema,
    LeadQuerySchema,
    LeadSourceSchema,
    LeadStatusSchema,
    LeadUpdateSchema,
} from '../validations/contact.schema';

export type LeadStatus = z.infer<typeof LeadStatusSchema>;
export type LeadSource = z.infer<typeof LeadSourceSchema>;
export type LeadNote = z.infer<typeof LeadNoteSchema>;
export type LeadUpdate = z.infer<typeof LeadUpdateSchema>;
export type ContactRequest = z.infer<typeof ContactRequestSchema>;
export type ContactForm = ContactRequest;
export type ConsentRecordSummary = z.infer<typeof ConsentRecordSummarySchema>;
export type LeadAdmin = z.infer<typeof LeadAdminSchema>;
export type LeadQuery = z.infer<typeof LeadQuerySchema>;
export type ContactFormSectionModel = z.infer<typeof ContactUsFormSchema>;
export type ContactHeroSectionModel = z.infer<typeof ContactUsHeroSchema>;

export interface IContactModel {
    id: string;
    fullName: string;
    subject: string;
    email: string;
    department?: string;
    message: string;
    status: string;
}

export type ContactModel = IContactModel & { id: string; createdAt: string; updatedAt: string };
export type ContactQueryModel = LeadQuery | {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
};
export type ContactStatusModel = { status: LeadStatus | string };
export type ContactAdmin = LeadAdmin;
export type ContactFormModel = ContactRequest;
