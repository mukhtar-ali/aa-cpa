import { z } from 'zod';
import { PaginationParamsSchema } from '../validations';

export type PaginationParamsModel = z.infer<typeof PaginationParamsSchema>;

export interface PaginatorModel<T> extends IPaginatorMetadataModel {
    items: T[];
}

export interface IPaginatorMetadataModel {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}
