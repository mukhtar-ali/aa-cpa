export enum PermissionEnum {
    PermissionsUpdate = 'permissions.update',
    AdminPortalUsersCreate = 'admin_portal.users.create',
    AdminPortalUsersUpdate = 'admin_portal.users.update',
    AdminPortalUsersDelete = 'admin_portal.users.delete',
    AdminPortalUsersView = 'admin_portal.users.view',
    AdminPortalUsersActivate = 'admin_portal.users.activate',
    AdminPortalManageContent = 'admin_portal.manage_content',

    // CPA Services
    AdminPortalServicesCreate = 'admin_portal.services.create',
    AdminPortalServicesUpdate = 'admin_portal.services.update',
    AdminPortalServicesDelete = 'admin_portal.services.delete',
    AdminPortalServicesView = 'admin_portal.services.view',

    // CPA Sectors
    AdminPortalSectorsCreate = 'admin_portal.sectors.create',
    AdminPortalSectorsUpdate = 'admin_portal.sectors.update',
    AdminPortalSectorsDelete = 'admin_portal.sectors.delete',
    AdminPortalSectorsView = 'admin_portal.sectors.view',

    // CPA Site Content (Sections, Offices, Testimonials, Logos, Credentials, FAQs)
    AdminPortalSiteContentView = 'admin_portal.site_content.view',
    AdminPortalSiteContentUpdate = 'admin_portal.site_content.update',

    // CPA Leads (Contact requests + Quote requests)
    AdminPortalLeadsView = 'admin_portal.leads.view',
    AdminPortalLeadsUpdate = 'admin_portal.leads.update',
    AdminPortalLeadsExport = 'admin_portal.leads.export',
    AdminPortalLeadsErase = 'admin_portal.leads.erase',

    // CPA Job Applications
    AdminPortalApplicationsView = 'admin_portal.applications.view',
    AdminPortalApplicationsUpdate = 'admin_portal.applications.update',
    AdminPortalApplicationsExport = 'admin_portal.applications.export',
    AdminPortalApplicationsErase = 'admin_portal.applications.erase',

    // CPA Estimator
    AdminPortalEstimatorUpdate = 'admin_portal.estimator.update',

    // CPA Settings
    AdminPortalSettingsNotifications = 'admin_portal.settings.notifications',

    // Articles / News
    AdminPortalNewsCreate = 'admin_portal.news.create',
    AdminPortalNewsUpdate = 'admin_portal.news.update',
    AdminPortalNewsDelete = 'admin_portal.news.delete',
    AdminPortalNewsView = 'admin_portal.news.view',

    // Careers / Jobs
    AdminPortalCareersCreate = 'admin_portal.careers.create',
    AdminPortalCareersUpdate = 'admin_portal.careers.update',
    AdminPortalCareersDelete = 'admin_portal.careers.delete',
    AdminPortalCareersView = 'admin_portal.careers.view',

    MonitoringView = 'monitoring.view',
}

export const ALL_PERMISSIONS = Object.values(PermissionEnum);

export interface PermissionUI {
    key: PermissionEnum;
    displayName: string;
}

export interface PermissionGroupUI {
    group: string;
    displayName: string;
    permissions: PermissionUI[];
}

export const PERMISSIONS_UI: PermissionGroupUI[] = [
    {
        group: 'admin_portal_users',
        displayName: 'Admin Portal - Users Management',
        permissions: [
            { key: PermissionEnum.AdminPortalUsersCreate, displayName: 'Create User' },
            { key: PermissionEnum.AdminPortalUsersUpdate, displayName: 'Update User' },
            { key: PermissionEnum.AdminPortalUsersDelete, displayName: 'Delete User' },
            { key: PermissionEnum.AdminPortalUsersView, displayName: 'View Users' },
            { key: PermissionEnum.AdminPortalUsersActivate, displayName: 'Activate / Deactivate User' },
        ],
    },
    {
        group: 'permissions',
        displayName: 'Permissions Management',
        permissions: [{ key: PermissionEnum.PermissionsUpdate, displayName: 'Update Permissions' }],
    },
    {
        group: 'admin_portal_manage_content',
        displayName: 'Admin Portal - Manage Content',
        permissions: [{ key: PermissionEnum.AdminPortalManageContent, displayName: 'Manage Content' }],
    },
    {
        group: 'admin_portal_services',
        displayName: 'Admin Portal - Services Management',
        permissions: [
            { key: PermissionEnum.AdminPortalServicesCreate, displayName: 'Create Service' },
            { key: PermissionEnum.AdminPortalServicesUpdate, displayName: 'Update Service' },
            { key: PermissionEnum.AdminPortalServicesDelete, displayName: 'Delete Service' },
            { key: PermissionEnum.AdminPortalServicesView, displayName: 'View Services' },
        ],
    },
    {
        group: 'admin_portal_sectors',
        displayName: 'Admin Portal - Sectors Management',
        permissions: [
            { key: PermissionEnum.AdminPortalSectorsCreate, displayName: 'Create Sector' },
            { key: PermissionEnum.AdminPortalSectorsUpdate, displayName: 'Update Sector' },
            { key: PermissionEnum.AdminPortalSectorsDelete, displayName: 'Delete Sector' },
            { key: PermissionEnum.AdminPortalSectorsView, displayName: 'View Sectors' },
        ],
    },
    {
        group: 'admin_portal_site_content',
        displayName: 'Admin Portal - Site Content',
        permissions: [
            { key: PermissionEnum.AdminPortalSiteContentView, displayName: 'View Site Content' },
            { key: PermissionEnum.AdminPortalSiteContentUpdate, displayName: 'Update Site Content' },
        ],
    },
    {
        group: 'admin_portal_leads',
        displayName: 'Admin Portal - Leads & Contacts',
        permissions: [
            { key: PermissionEnum.AdminPortalLeadsView, displayName: 'View Leads' },
            { key: PermissionEnum.AdminPortalLeadsUpdate, displayName: 'Update Leads' },
            { key: PermissionEnum.AdminPortalLeadsExport, displayName: 'Export Leads CSV' },
            { key: PermissionEnum.AdminPortalLeadsErase, displayName: 'Erase Lead Data' },
        ],
    },
    {
        group: 'admin_portal_applications',
        displayName: 'Admin Portal - Job Applications',
        permissions: [
            { key: PermissionEnum.AdminPortalApplicationsView, displayName: 'View Applications' },
            { key: PermissionEnum.AdminPortalApplicationsUpdate, displayName: 'Update Applications' },
            { key: PermissionEnum.AdminPortalApplicationsExport, displayName: 'Export Applications CSV' },
            { key: PermissionEnum.AdminPortalApplicationsErase, displayName: 'Erase Application Data' },
        ],
    },
    {
        group: 'admin_portal_estimator',
        displayName: 'Admin Portal - Estimator',
        permissions: [
            { key: PermissionEnum.AdminPortalEstimatorUpdate, displayName: 'Update Estimator Config' },
        ],
    },
    {
        group: 'admin_portal_settings',
        displayName: 'Admin Portal - Settings',
        permissions: [
            { key: PermissionEnum.AdminPortalSettingsNotifications, displayName: 'Manage Notification & Spam Settings' },
        ],
    },
    {
        group: 'admin_portal_news',
        displayName: 'Admin Portal - Articles Management',
        permissions: [
            { key: PermissionEnum.AdminPortalNewsCreate, displayName: 'Create Article' },
            { key: PermissionEnum.AdminPortalNewsUpdate, displayName: 'Update Article' },
            { key: PermissionEnum.AdminPortalNewsDelete, displayName: 'Delete Article' },
            { key: PermissionEnum.AdminPortalNewsView, displayName: 'View Articles' },
        ],
    },
    {
        group: 'admin_portal_careers',
        displayName: 'Admin Portal - Careers Management',
        permissions: [
            { key: PermissionEnum.AdminPortalCareersCreate, displayName: 'Create Job' },
            { key: PermissionEnum.AdminPortalCareersUpdate, displayName: 'Update Job' },
            { key: PermissionEnum.AdminPortalCareersDelete, displayName: 'Delete Job' },
            { key: PermissionEnum.AdminPortalCareersView, displayName: 'View Careers' },
        ],
    },
    {
        group: 'monitoring',
        displayName: 'System Monitoring',
        permissions: [{ key: PermissionEnum.MonitoringView, displayName: 'View Monitoring' }],
    },
];
