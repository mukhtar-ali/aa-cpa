const tagRefetchMap = new Map<string, () => void>();

export const registerTag = (tag: string, refetchFn: () => void) => {
    tagRefetchMap.set(tag, refetchFn);
};

export const invalidateTag = (tag: string) => {
    const refetch = tagRefetchMap.get(tag);
    if (refetch) refetch();
};
