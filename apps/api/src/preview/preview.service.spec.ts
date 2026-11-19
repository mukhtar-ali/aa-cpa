import { PreviewService } from './preview.service';

describe('PreviewService', () => {
    let service: PreviewService;

    beforeEach(() => {
        service = new PreviewService();
    });

    it('issues a valid token and verifies it with matching scope', () => {
        const { token, url } = service.issueToken({ kind: 'service', key: 'external-audit' });
        expect(typeof token).toBe('string');
        expect(url).toContain('/api/preview?token=');
        expect(url).toContain('kind=service');
        expect(url).toContain('key=external-audit');

        const verified = service.verifyToken(token, { kind: 'service', key: 'external-audit' });
        expect(verified).toMatchObject({
            kind: 'service',
            key: 'external-audit',
        });
    });

    it('returns null for forged token (treated as anonymous)', () => {
        const { token } = service.issueToken({ kind: 'service', key: 'external-audit' });
        const forged = token.slice(0, -4) + 'xxxx';
        expect(service.verifyToken(forged)).toBeNull();
    });

    it('returns null for expired token (treated as anonymous)', () => {
        const { token } = service.issueToken({ kind: 'service', key: 'external-audit' }, -10);
        expect(service.verifyToken(token)).toBeNull();
    });

    it('enforces token scope: rejects when kind or key mismatches', () => {
        const { token } = service.issueToken({ kind: 'service', key: 'external-audit' });
        expect(service.verifyToken(token, { kind: 'article', key: 'external-audit' })).toBeNull();
        expect(service.verifyToken(token, { kind: 'service', key: 'zakat-tax' })).toBeNull();
    });
});
