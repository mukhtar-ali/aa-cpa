import { z } from 'zod';
import { Localized } from '../utils/localized.type';
import { ProjectFormSchema, ProjectQuerySchema, ProjectTranslationSchema } from '../validations';
import { UnitModel } from './units.model';
import { FontModelWeb } from './font.model';

export type ProjectTranslatableKey = keyof z.infer<typeof ProjectTranslationSchema>;

export const getProjectTranslatableKeys = (): ProjectTranslatableKey[] =>
    Object.keys(ProjectTranslationSchema.shape) as ProjectTranslatableKey[];

export type ProjectFormModel = z.infer<typeof ProjectFormSchema>;

export type ProjectModel = ProjectFormModel & {
    id: string;
    createdAt: string;
    updatedAt: string;
    rank: number;
    units?: UnitModel[];
};

export type ProjectQueryModel = z.infer<typeof ProjectQuerySchema>;
export type ProjectModelWeb = Localized<ProjectModel>;
export type ProjectSlugModelWeb = Omit<ProjectModelWeb, 'font'> & { font: FontModelWeb };
