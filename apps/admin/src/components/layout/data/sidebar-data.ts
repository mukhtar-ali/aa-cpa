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
    ShieldCheck,
    Building2,
    Calculator,
    FolderTree,
    UserCheck,
    Layers,
    Bell,
    Shield,
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
            name: 'CPA Admin Portal',
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
                    id: 'leads',
                    title: 'Leads & PDPL',
                    url: '/leads',
                    icon: Mail,
                    permission: PermissionEnum.AdminPortalLeadsView,
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
            title: 'CPA Content',
            items: [
                {
                    title: 'Services',
                    url: '/services',
                    icon: ShieldCheck,
                    permission: PermissionEnum.AdminPortalServicesView,
                },
                {
                    title: 'Sectors',
                    url: '/sectors',
                    icon: Building2,
                    permission: PermissionEnum.AdminPortalSectorsView,
                },
                {
                    title: 'Articles & Insights',
                    url: '/news',
                    icon: Newspaper,
                    permission: PermissionEnum.AdminPortalNewsView,
                },
                {
                    title: 'Article Categories',
                    url: '/article-categories',
                    icon: FolderTree,
                    permission: PermissionEnum.AdminPortalNewsView,
                },
                {
                    title: 'Authors',
                    url: '/authors',
                    icon: UserCheck,
                    permission: PermissionEnum.AdminPortalNewsView,
                },
                {
                    title: 'Careers & Jobs',
                    url: '/careers',
                    icon: Briefcase,
                    permission: PermissionEnum.AdminPortalCareersView,
                },
                {
                    title: 'Job Departments',
                    url: '/job-departments',
                    icon: Landmark,
                    permission: PermissionEnum.AdminPortalCareersView,
                },
                {
                    title: 'Site Content & References',
                    url: '/site-content',
                    icon: Layers,
                    permission: PermissionEnum.AdminPortalSiteContentView,
                },
                {
                    title: 'Fee Estimator',
                    url: '/estimator',
                    icon: Calculator,
                    permission: PermissionEnum.AdminPortalEstimatorUpdate,
                },
                {
                    title: 'Home',
                    url: '/home',
                    icon: HomeIcon,
                    permission: PermissionEnum.AdminPortalManageContent,
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
                        {
                            title: 'Notifications & Retention',
                            url: '/settings/notifications',
                            icon: Bell,
                        },
                        {
                            title: 'Spam & Bot Protection',
                            url: '/settings/spam',
                            icon: Shield,
                        },
                    ],
                },
            ],
        },
    ],
}
