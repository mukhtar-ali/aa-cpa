import {
    LayoutDashboard,
    Palette,
    Settings,
    Wrench,
    UserCog,
    Users,
    Command,
    Info,
    Mail,
    Share2,
    Search,
    Landmark,
    Activity,
    BarChart3,
    AlertTriangle,
    Radar,
    Send,
    Newspaper,
    Briefcase,
    FileText,
    Phone,
    Home as HomeIcon,
} from 'lucide-react'
import { PermissionEnum } from '@repo/shared'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
    user: {
        name: 'Admin User',
        email: 'admin@example.com',
        avatar: '/avatars/shadcn.jpg',
    },
    teams: [
        {
            name: 'Admin Panel',
            logo: Command,
            plan: 'NestJS + ShadcnUI',
        },
    ],
    navGroups: [
        {
            title: 'General',
            items: [
                {
                    title: 'Dashboard',
                    url: '/',
                    icon: LayoutDashboard,
                },
                {
                    title: 'Monitoring',
                    icon: Activity,
                    permission: PermissionEnum.MonitoringView,
                    items: [
                        {
                            title: 'Performance',
                            url: '/monitoring',
                            icon: BarChart3,
                        },
                        {
                            title: 'Analytics',
                            url: '/monitoring/analytics',
                            icon: Activity,
                        },
                        {
                            title: 'Errors',
                            url: '/monitoring/errors',
                            icon: AlertTriangle,
                        },
                    ],
                },
                {
                    id: 'inquiries',
                    title: 'Inquiries',
                    url: '/inquiries',
                    icon: Mail,
                    permission: PermissionEnum.AdminPortalManageContent,
                },
                {
                    id: 'contact-submissions',
                    title: 'Contact Submissions',
                    url: '/contact-submissions',
                    icon: Mail,
                    permission: PermissionEnum.AdminPortalManageContent,
                },
                {
                    title: 'Users',
                    url: '/users',
                    icon: Users,
                    permission: PermissionEnum.AdminPortalUsersView,
                },
            ],
        },
        {
            title: 'Content',
            items: [
                {
                    title: 'Home',
                    url: '/home',
                    icon: HomeIcon,
                    permission: PermissionEnum.AdminPortalManageContent,
                },
                {
                    title: 'Projects',
                    url: '/projects',
                    icon: Landmark,
                    permission: PermissionEnum.AdminPortalProjectsView,
                },
                {
                    title: 'News & Events',
                    url: '/news',
                    icon: Newspaper,
                    permission: PermissionEnum.AdminPortalNewsView,
                },
                {
                    title: 'Careers',
                    url: '/careers',
                    icon: Briefcase,
                    permission: PermissionEnum.AdminPortalCareersView,
                },
                {
                    title: 'About Page',
                    url: '/about-page',
                    icon: FileText,
                    permission: PermissionEnum.AdminPortalManageContent,
                },
                {
                    title: 'Contact Page',
                    url: '/contact-page',
                    icon: Phone,
                    permission: PermissionEnum.AdminPortalManageContent,
                },
            ],
        },
        {
            title: 'Other',
            items: [
                {
                    title: 'User Preferences',
                    icon: UserCog,
                    items: [
                        {
                            title: 'Profile',
                            url: '/user',
                            icon: UserCog,
                        },
                        {
                            title: 'Account',
                            url: '/user/account',
                            icon: Wrench,
                        },
                        {
                            title: 'Appearance',
                            url: '/user/appearance',
                            icon: Palette,
                        },
                    ],
                },
                {
                    title: 'System Settings',
                    icon: Settings,
                    permission: PermissionEnum.AdminPortalManageContent,
                    items: [
                        {
                            title: 'General Info',
                            url: '/settings',
                            icon: Info,
                        },
                        {
                            title: 'Social Media',
                            url: '/settings/social',
                            icon: Share2,
                        },
                        {
                            title: 'SEO Settings',
                            url: '/settings/seo',
                            icon: Search,
                        },
                        {
                            title: 'Site SEO & Tracking',
                            url: '/settings/seo-tracking',
                            icon: Radar,
                        },
                        {
                            title: 'Email Settings',
                            url: '/settings/email',
                            icon: Send,
                        },
                    ],
                },
            ],
        },
    ],
}
