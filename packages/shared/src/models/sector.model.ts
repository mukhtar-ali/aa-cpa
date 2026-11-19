import { z } from 'zod';
import {
    SectorFormSchema,
    SectorAdminSchema,
    SectorSummaryWebSchema,
    SectorDetailWebSchema,
    SectorStatItemSchema,
    SectorPainPointItemSchema,
} from '../validations/sector.schema';

export type SectorForm = z.infer<typeof SectorFormSchema>;
export type SectorAdmin = z.infer<typeof SectorAdminSchema>;
export type SectorSummaryWeb = z.infer<typeof SectorSummaryWebSchema>;
export type SectorDetailWeb = z.infer<typeof SectorDetailWebSchema>;
export type SectorStatItem = z.infer<typeof SectorStatItemSchema>;
export type SectorPainPointItem = z.infer<typeof SectorPainPointItemSchema>;
