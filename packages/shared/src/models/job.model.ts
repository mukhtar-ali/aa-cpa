import { z } from 'zod';
import {
    CareersPageSettingsSchema, EmploymentTypeSchema, JobApplicationFormSchema,
    JobApplicationQuerySchema, JobApplicationStatusSchema, JobFormSchema, JobQuerySchema,
} from '../validations/job.schema';
import { Localized } from '../utils/localized.type';

export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;
export type JobFormModel = z.infer<typeof JobFormSchema>;
export type JobQueryModel = z.infer<typeof JobQuerySchema>;

export interface JobModel extends JobFormModel {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export type JobModelWeb = Localized<JobModel>;

export type JobApplicationFormModel = z.infer<typeof JobApplicationFormSchema>;
export type JobApplicationStatusModel = z.infer<typeof JobApplicationStatusSchema>;
export type JobApplicationQueryModel = z.infer<typeof JobApplicationQuerySchema>;

export interface JobApplicationModel {
    id: string;
    jobId: string;
    job?: { title: Record<string, string>; slug: string | null };
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    coverLetter?: string;
    resumeUrl?: string;
    status: 'pending' | 'reviewed' | 'rejected' | 'hired';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export type CareersPageSettingsModel = z.infer<typeof CareersPageSettingsSchema>;
export type CareersPageSettingsModelWeb = Localized<CareersPageSettingsModel>;
