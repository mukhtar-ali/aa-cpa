import { z } from 'zod';
import { csvList, PaginationParamsSchema } from './pagination.schema';
import { getDefaultMultiLanguageField, MultiLanguageFieldSchema } from './common.schema';
import { getDefaultResonsiveFile, ResponsiveFileSchemaOptional } from './file.schema';

export const ContactFormSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    subject: z.string().min(1, 'Subject is required'),
    email: z.string().email('Invalid email address'),
    department: z.string().min(1, 'Department is required'),
    message: z.string().min(1, 'Message is required'),
});

export const ContactQuerySchema = PaginationParamsSchema.extend({
    status: csvList(z.enum(['new', 'contacted', 'closed'])),
});

export const ContactStatusSchema = z.object({
    status: z.enum(['new', 'contacted', 'closed']),
});

export const ContactUsHeroSchema = z.object({
    backgroundImage: ResponsiveFileSchemaOptional,
    title: MultiLanguageFieldSchema,
    subtitle: MultiLanguageFieldSchema,
});

export const ContactUsFormSchema = z.object({
    title: MultiLanguageFieldSchema,
    description: MultiLanguageFieldSchema,
});

export const getContactHeroSection = (): z.infer<typeof ContactUsHeroSchema> => ({
    title: getDefaultMultiLanguageField(),
    subtitle: getDefaultMultiLanguageField(),
    backgroundImage: getDefaultResonsiveFile(),
});

export const getContactFormSection = (): z.infer<typeof ContactUsFormSchema> => ({
    title: getDefaultMultiLanguageField(),
    description: getDefaultMultiLanguageField(),
});
