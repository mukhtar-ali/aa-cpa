export const REMOVED_PERMISSION_PREFIXES = [
    'admin_portal.projects.',
    'admin_portal.media.',
    'admin_portal.group_locations',
];

export function isLegacyPermission(perm: string): boolean {
    return REMOVED_PERMISSION_PREFIXES.some((prefix) => perm === prefix || perm.startsWith(prefix));
}

export function stripLegacyPermissions(permissions: unknown): string[] {
    if (!permissions) return [];
    let list: string[] = [];
    if (typeof permissions === 'string') {
        try {
            const parsed = JSON.parse(permissions);
            if (Array.isArray(parsed)) {
                list = parsed;
            }
        } catch {
            return [];
        }
    } else if (Array.isArray(permissions)) {
        list = permissions;
    }
    return list.filter((p) => typeof p === 'string' && !isLegacyPermission(p));
}
