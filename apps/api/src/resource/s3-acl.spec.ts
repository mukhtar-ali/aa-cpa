import { ObjectCannedACL } from '@aws-sdk/client-s3';
import { isS3AclSetting, resolveS3Acl } from './s3-acl';

describe('resolveS3Acl (MUK-473)', () => {
    it.each([
        [undefined, ObjectCannedACL.public_read],
        ['', ObjectCannedACL.public_read],
        ['   ', ObjectCannedACL.public_read],
        ['public-read', ObjectCannedACL.public_read],
        ['PUBLIC-READ', ObjectCannedACL.public_read],
        ['private', ObjectCannedACL.private],
        [' Private ', ObjectCannedACL.private],
    ])('%j -> %s', (setting, expected) => {
        expect(resolveS3Acl(setting)).toBe(expected);
    });

    it('"none" sends no ACL at all (buckets with Bucket-owner-enforced ownership reject any ACL)', () => {
        expect(resolveS3Acl('none')).toBeUndefined();
        expect(resolveS3Acl('NONE')).toBeUndefined();
    });

    it.each(['public', 'authenticated-read', 'bucket-owner-full-control', 'true', '1', 'public_read'])(
        'refuses %j instead of silently falling back',
        (setting) => {
            expect(() => resolveS3Acl(setting)).toThrow(/S3_OBJECT_ACL must be one of/);
        },
    );

    it('isS3AclSetting only accepts the three documented values', () => {
        expect(['public-read', 'private', 'none'].every(isS3AclSetting)).toBe(true);
        expect(isS3AclSetting('Private')).toBe(false);
        expect(isS3AclSetting('')).toBe(false);
    });
});
