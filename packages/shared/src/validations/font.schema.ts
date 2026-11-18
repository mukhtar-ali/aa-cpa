import { z } from 'zod';
import { createNewUuid } from '../utils';
import { urlValidation } from './base.schema';

export const FontSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    url: urlValidation,
});

export const FontListSchema = z.object({
    fonts: z.array(FontSchema),
});

export const getDefaultFont = (): z.infer<typeof FontSchema> => ({
    id: createNewUuid(),
    name: '',
    url: '',
});

export const getDefaultFontList = (): z.infer<typeof FontListSchema> => ({ fonts: [] });
