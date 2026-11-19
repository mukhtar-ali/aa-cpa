import { ConsentService } from './consent.service';

describe('ConsentService', () => {
    let service: ConsentService;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            section: {
                findUnique: jest.fn().mockResolvedValue({
                    type: 'legal-privacy',
                    data: { version: '2.1' },
                }),
            },
            consentRecord: {
                create: jest.fn().mockImplementation(({ data }: any) =>
                    Promise.resolve({ id: 'consent-1', ...data }),
                ),
            },
        };
        service = new ConsentService(prisma);
    });

    it('hashes IP address deterministically with server pepper (never storing raw IP)', () => {
        const hash1 = service.hashIp('192.168.1.50');
        const hash2 = service.hashIp('192.168.1.50');
        expect(hash1).toBe(hash2);
        expect(hash1).toHaveLength(64);
        expect(hash1).not.toContain('192.168.1.50');
    });

    it('records a ConsentRecord using policyVersion from legal-privacy section', async () => {
        const res = await service.recordConsent({
            subjectType: 'contact',
            subjectId: 'lead-123',
            email: 'user@example.com',
            purpose: 'contact_request',
            language: 'ar',
            ip: '10.0.0.1',
            userAgent: 'Mozilla/5.0',
        });

        expect(prisma.consentRecord.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                subjectType: 'contact',
                subjectId: 'lead-123',
                email: 'user@example.com',
                purpose: 'contact_request',
                policyVersion: '2.1',
                language: 'ar',
                ipHash: expect.stringMatching(/^[a-f0-9]{64}$/),
                userAgent: 'Mozilla/5.0',
            }),
        });
        expect(res.policyVersion).toBe('2.1');
    });
});
