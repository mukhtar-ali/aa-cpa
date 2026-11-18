import { z } from 'zod';
import { ImageOrVideoResponsiveSchema, ResponsiveFileSchema, ResponsiveFileSchemaOptional } from '../validations';

export type ResponsiveFileModel = z.infer<typeof ResponsiveFileSchema>;
export type ResponsiveFileModelOptional = z.infer<typeof ResponsiveFileSchemaOptional>;
export type ImageOrVideoResponsiveModel = z.infer<typeof ImageOrVideoResponsiveSchema>;
