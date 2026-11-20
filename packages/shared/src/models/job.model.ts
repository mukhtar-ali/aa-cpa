import { z } from 'zod';
import {
    EmploymentTypeSchema,
    JobAdminSchema,
    JobApplicationAdminSchema,
    JobApplicationFormSchema,
    JobApplicationNoteSchema,
    JobApplicationQuerySchema,
    JobApplicationSchema,
    JobApplicationStatusEnum,
    JobApplicationStatusSchema,
    JobDepartmentAdminSchema,
    JobDepartmentFormSchema,
    JobDepartmentWebSchema,
    JobDetailWebSchema,
    JobFormSchema,
    JobQuerySchema,
    JobSummaryWebSchema,
    JobTranslationSchema,
    CareersPageSettingsSchema,
    CareersPageWorkFieldSchema,
} from '../validations/job.schema';
import { Localized } from '../utils/localized.type';

export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;

export type JobDepartmentFormModel = z.infer<typeof JobDepartmentFormSchema>;
export type JobDepartmentAdminModel = z.infer<typeof JobDepartmentAdminSchema>;
export type JobDepartmentWeb = z.infer<typeof JobDepartmentWebSchema>;
export type JobDepartmentAdmin = JobDepartmentAdminModel;
export type JobDepartmentForm = JobDepartmentFormModel;

export type JobTranslationModel = z.infer<typeof JobTranslationSchema>;
export type JobFormModel = z.infer<typeof JobFormSchema>;
export type JobAdminModel = z.infer<typeof JobAdminSchema>;
export type JobAdmin = JobAdminModel;
export type JobQueryModel = z.infer<typeof JobQuerySchema>;

export type JobSummaryWeb = z.infer<typeof JobSummaryWebSchema>;
export type JobDetailWeb = z.infer<typeof JobDetailWebSchema>;

export type JobApplicationStatus = z.infer<typeof JobApplicationStatusEnum>;
export type JobApplication = z.infer<typeof JobApplicationSchema>;
export type JobApplicationFormModel = z.infer<typeof JobApplicationFormSchema>;
export type JobApplicationAdminModel = z.infer<typeof JobApplicationAdminSchema>;
export type JobApplicationStatusModel = z.infer<typeof JobApplicationStatusSchema>;
export type JobApplicationNote = z.infer<typeof JobApplicationNoteSchema>;
export type JobApplicationQueryModel = z.infer<typeof JobApplicationQuerySchema>;
export type JobApplicationModel = JobApplicationAdminModel;

export interface JobModel extends JobFormModel {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export type CareersPageSettingsModel = z.infer<typeof CareersPageSettingsSchema>;
export type CareersPageWorkFieldModel = z.infer<typeof CareersPageWorkFieldSchema>;


export type JobModelWeb = Localized<JobModel>;
