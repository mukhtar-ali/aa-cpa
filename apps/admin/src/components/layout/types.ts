import { type LinkProps } from '@tanstack/react-router'
import { type PermissionEnum } from '@repo/shared'

type User = {
    name: string
    email: string
    avatar: string
}

type Team = {
    name: string
    logo: React.ElementType
    plan: string
}

type BaseNavItem = {
    id?: string
    title: string
    badge?: string
    icon?: React.ElementType
    /** If set, the item is hidden unless the current user has this permission. */
    permission?: PermissionEnum
}

type NavLink = BaseNavItem & {
    url: LinkProps['to'] | (string & {})
    items?: never
}

type NavCollapsible = BaseNavItem & {
    items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[]
    url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
    title: string
    items: NavItem[]
}

type SidebarData = {
    user: User
    teams: Team[]
    navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
