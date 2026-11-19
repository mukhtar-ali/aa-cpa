export const areAllTrue = (obj?: Record<string, boolean>): boolean => {
    if (!obj) return false;
    const values = Object.values(obj);
    if (values.length === 0) return false;
    return values.every(Boolean);
};

export const isAnyTrue = (obj?: Record<string, boolean>): boolean => {
    if (!obj) return false;
    const values = Object.values(obj);
    if (values.length === 0) return false;
    return values.some(Boolean);
};

export const buildBooleanObject = (
    obj: Record<string, boolean>,
    value: boolean,
): Record<string, boolean> => {
    return Object.keys(obj).reduce(
        (acc, key) => { acc[key] = value; return acc; },
        {} as Record<string, boolean>,
    );
};
