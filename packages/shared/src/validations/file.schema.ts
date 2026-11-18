import { z } from 'zod';
import { MediaType, ResponsiveFileType } from '../enums';
import { urlValidation } from './base.schema';
import { MediaTypeSchema } from './common.schema';

export const ResponsiveFileSchema = z.object({
    [ResponsiveFileType.Desktop]: urlValidation,
    [ResponsiveFileType.Tablet]: urlValidation,
    [ResponsiveFileType.Mobile]: urlValidation,
});

export const ResponsiveFileSchemaOptional = z.object({
    [ResponsiveFileType.Desktop]: z.string().url().optional().or(z.literal('')),
    [ResponsiveFileType.Tablet]: z.string().url().optional().or(z.literal('')),
    [ResponsiveFileType.Mobile]: z.string().url().optional().or(z.literal('')),
});

export const getDefaultResonsiveFile = (): z.infer<typeof ResponsiveFileSchemaOptional> => ({
    desktop: '',
    tablet: '',
    mobile: '',
});

export const ImageOrVideoResponsiveSchema = z.object({
    image: ResponsiveFileSchemaOptional,
    video: ResponsiveFileSchemaOptional,
    mediaType: MediaTypeSchema,
});

export const getImageOrVideoResponsiveDefault = (): z.infer<typeof ImageOrVideoResponsiveSchema> => ({
    image: getDefaultResonsiveFile(),
    video: getDefaultResonsiveFile(),
    mediaType: MediaType.Image,
});
