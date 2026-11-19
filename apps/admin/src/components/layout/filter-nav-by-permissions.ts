import type { PermissionEnum } from '@repo/shared'
import type { NavGroup } from './types'

export function filterNavGroupsByPermissions(
    navGroups: NavGroup[],
    permissions: PermissionEnum[] | undefined,
): NavGroup[] {
    const has = (permission?: PermissionEnum) => !permission || (permissions?.includes(permission) ?? false)

    return navGroups
        .map((group) => ({
            ...group,
            items: group.items
                .filter((item) => has(item.permission))
                .map((item) =>
                    'items' in item && item.items
                        ? { ...item, items: item.items.filter((subItem) => has(subItem.permission)) }
                        : item,
                )
                .filter((item) => !('items' in item && item.items) || item.items.length > 0),
        }))
        .filter((group) => group.items.length > 0)
}
