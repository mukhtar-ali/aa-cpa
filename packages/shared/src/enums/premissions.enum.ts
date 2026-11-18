export enum PermissionEnum {
    PermissionsUpdate = 'permissions.update',
    AdminPortalUsersCreate = 'admin_portal.users.create',
    AdminPortalUsersUpdate = 'admin_portal.users.update',
    AdminPortalUsersDelete = 'admin_portal.users.delete',
    AdminPortalUsersView = 'admin_portal.users.view',
    AdminPortalUsersActivate = 'admin_portal.users.activate',
    AdminPortalManageContent = 'admin_portal.manage_content',
    AdminPortalProjectsCreate = 'admin_portal.projects.create',
    AdminPortalProjectsUpdate = 'admin_portal.projects.update',
    AdminPortalProjectsDelete = 'admin_portal.projects.delete',
    AdminPortalProjectsView = 'admin_portal.projects.view',
    AdminPortalGroupLocations = 'admin_portal.group_locations',
    AdminPortalMediaCreate = 'admin_portal.media.create',
    AdminPortalMediaUpdate = 'admin_portal.media.update',
    AdminPortalMediaDelete = 'admin_portal.media.delete',
    AdminPortalMediaView = 'admin_portal.media.view',
    AdminPortalNewsCreate = 'admin_portal.news.create',
    AdminPortalNewsUpdate = 'admin_portal.news.update',
    AdminPortalNewsDelete = 'admin_portal.news.delete',
    AdminPortalNewsView = 'admin_portal.news.view',
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
        group: 'admin_portal_projects',
        displayName: 'Admin Portal - Projects Management',
        permissions: [
            { key: PermissionEnum.AdminPortalProjectsCreate, displayName: 'Create Project' },
            { key: PermissionEnum.AdminPortalProjectsUpdate, displayName: 'Update Project' },
            { key: PermissionEnum.AdminPortalProjectsDelete, displayName: 'Delete Project' },
            { key: PermissionEnum.AdminPortalProjectsView, displayName: 'View Projects' },
        ],
    },
    {
        group: 'admin_portal_media',
        displayName: 'Admin Portal - Media Management',
        permissions: [
            { key: PermissionEnum.AdminPortalMediaCreate, displayName: 'Create Media' },
            { key: PermissionEnum.AdminPortalMediaUpdate, displayName: 'Update Media' },
            { key: PermissionEnum.AdminPortalMediaDelete, displayName: 'Delete Media' },
            { key: PermissionEnum.AdminPortalMediaView, displayName: 'View Media' },
        ],
    },
    {
        group: 'admin_portal_news',
        displayName: 'Admin Portal - News Management',
        permissions: [
            { key: PermissionEnum.AdminPortalNewsCreate, displayName: 'Create News' },
            { key: PermissionEnum.AdminPortalNewsUpdate, displayName: 'Update News' },
            { key: PermissionEnum.AdminPortalNewsDelete, displayName: 'Delete News' },
            { key: PermissionEnum.AdminPortalNewsView, displayName: 'View News' },
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
];
