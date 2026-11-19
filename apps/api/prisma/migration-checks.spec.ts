import { isLegacyPermission, stripLegacyPermissions } from './strip-legacy-permissions';

describe('Data Migration Checks: Stripping Legacy Permissions', () => {
    it('identifies legacy project, media, and group_locations permissions', () => {
        expect(isLegacyPermission('admin_portal.projects.create')).toBe(true);
        expect(isLegacyPermission('admin_portal.projects.update')).toBe(true);
        expect(isLegacyPermission('admin_portal.projects.delete')).toBe(true);
        expect(isLegacyPermission('admin_portal.projects.view')).toBe(true);
        expect(isLegacyPermission('admin_portal.group_locations')).toBe(true);
        expect(isLegacyPermission('admin_portal.media.create')).toBe(true);
        expect(isLegacyPermission('admin_portal.media.update')).toBe(true);
        expect(isLegacyPermission('admin_portal.media.delete')).toBe(true);
        expect(isLegacyPermission('admin_portal.media.view')).toBe(true);

        // CPA & active starter permissions should NOT be identified as legacy
        expect(isLegacyPermission('admin_portal.users.view')).toBe(false);
        expect(isLegacyPermission('admin_portal.services.view')).toBe(false);
        expect(isLegacyPermission('admin_portal.leads.view')).toBe(false);
        expect(isLegacyPermission('monitoring.view')).toBe(false);
    });

    it('strips legacy permissions from an array of strings', () => {
        const input = [
            'admin_portal.users.view',
            'admin_portal.projects.create',
            'admin_portal.projects.view',
            'admin_portal.group_locations',
            'admin_portal.media.view',
            'admin_portal.services.view',
        ];
        const result = stripLegacyPermissions(input);
        expect(result).toEqual([
            'admin_portal.users.view',
            'admin_portal.services.view',
        ]);
    });

    it('strips legacy permissions from a JSON stringified array', () => {
        const json = JSON.stringify([
            'admin_portal.projects.delete',
            'admin_portal.leads.view',
        ]);
        const result = stripLegacyPermissions(json);
        expect(result).toEqual(['admin_portal.leads.view']);
    });

    it('handles null, undefined, and non-array safely', () => {
        expect(stripLegacyPermissions(null)).toEqual([]);
        expect(stripLegacyPermissions(undefined)).toEqual([]);
        expect(stripLegacyPermissions('invalid-json')).toEqual([]);
    });
});
