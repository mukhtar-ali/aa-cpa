import { z } from 'zod';
import {
    StatWebSchema,
    PillarWebSchema,
    ProcessStepWebSchema,
    PageHeroWebSchema,
    HomePageWebSchema,
    HomePageSectionSchema,
    ServicesPageWebSchema,
    ServicesPageSectionSchema,
    ServiceSharedSectionSchema,
    SectorsPageWebSchema,
    SectorsPageSectionSchema,
    ArticlesPageWebSchema,
    ArticlesPageSectionSchema,
    CareersPageWebSchema,
    CareersPageSectionSchema,
    ContactPageWebSchema,
    ContactPageSectionSchema,
    AboutPageWebSchema,
    AboutPageSectionSchema,
    LegalPageWebSchema,
    LegalPageSectionSchema,
} from '../validations/pages.schema';

export type StatWeb = z.infer<typeof StatWebSchema>;
export type PillarWeb = z.infer<typeof PillarWebSchema>;
export type ProcessStepWeb = z.infer<typeof ProcessStepWebSchema>;
export type PageHeroWeb = z.infer<typeof PageHeroWebSchema>;
export type HomePageWeb = z.infer<typeof HomePageWebSchema>;
export type HomePageSection = z.infer<typeof HomePageSectionSchema>;
export type ServicesPageWeb = z.infer<typeof ServicesPageWebSchema>;
export type ServicesPageSection = z.infer<typeof ServicesPageSectionSchema>;
export type ServiceSharedSection = z.infer<typeof ServiceSharedSectionSchema>;
export type SectorsPageWeb = z.infer<typeof SectorsPageWebSchema>;
export type SectorsPageSection = z.infer<typeof SectorsPageSectionSchema>;
export type ArticlesPageWeb = z.infer<typeof ArticlesPageWebSchema>;
export type ArticlesPageSection = z.infer<typeof ArticlesPageSectionSchema>;
export type CareersPageWeb = z.infer<typeof CareersPageWebSchema>;
export type CareersPageSection = z.infer<typeof CareersPageSectionSchema>;
export type ContactPageWeb = z.infer<typeof ContactPageWebSchema>;
export type ContactPageSection = z.infer<typeof ContactPageSectionSchema>;
export type AboutPageWeb = z.infer<typeof AboutPageWebSchema>;
export type AboutPageSection = z.infer<typeof AboutPageSectionSchema>;
export type LegalPageWeb = z.infer<typeof LegalPageWebSchema>;
export type LegalPageSection = z.infer<typeof LegalPageSectionSchema>;
