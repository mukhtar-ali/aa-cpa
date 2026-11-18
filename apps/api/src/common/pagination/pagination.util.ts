export interface PaginateResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export function buildPaginationResult<T>(
    items: T[],
    total: number,
    pageNumber: number,
    pageSize: number,
): PaginateResult<T> {
    return {
        items,
        totalCount: total,
        pageNumber: Number(pageNumber),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / pageSize),
    };
}
