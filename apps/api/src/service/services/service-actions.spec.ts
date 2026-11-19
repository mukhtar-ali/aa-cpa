import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ListServicesService } from './list-services.service';
import { GetServiceBySlugService } from './get-service-by-slug.service';
import { CreateServiceService } from './create-service.service';
import { UpdateServiceService } from './update-service.service';
import { DeleteServiceService } from './delete-service.service';
import { PublishServiceService } from './publish-service.service';
import { ReorderServicesService } from './reorder-services.service';

describe('Service Actions', () => {
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = {
            service: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                count: jest.fn(),
            },
            serviceTranslation: {
                upsert: jest.fn(),
            },
            serviceSector: {
                deleteMany: jest.fn(),
                createMany: jest.fn(),
            },
            slugRedirect: {
                findUnique: jest.fn(),
                upsert: jest.fn(),
            },
            contact: {
                count: jest.fn().mockResolvedValue(0),
            },
            articleService: {
                count: jest.fn().mockResolvedValue(0),
            },
            $transaction: jest.fn((cb) => (typeof cb === 'function' ? cb(mockPrisma) : Promise.all(cb))),
        };
    });

    describe('ListServicesService', () => {
        it('lists published services for public web sorted by order ASC', async () => {
            mockPrisma.service.findMany.mockResolvedValue([
                {
                    id: 's-1',
                    slug: 'audit',
                    order: 1,
                    isPublished: true,
                    translations: [{ language: 'ar', title: 'تدقيق', summary: 'ملخص' }],
                },
            ]);

            const service = new ListServicesService(mockPrisma);
            const result = await service.listWeb('ar');

            expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ isPublished: true, isDeleted: false }),
                    orderBy: { order: 'asc' },
                }),
            );
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('تدقيق');
        });
    });

    describe('GetServiceBySlugService', () => {
        it('throws NotFoundException when service does not exist and no redirect exists', async () => {
            mockPrisma.service.findFirst.mockResolvedValue(null);
            mockPrisma.slugRedirect.findUnique.mockResolvedValue(null);

            const service = new GetServiceBySlugService(mockPrisma);
            await expect(service.getBySlugWeb('unknown', 'ar')).rejects.toThrow(NotFoundException);
        });

        it('returns redirect when slug exists in SlugRedirect table', async () => {
            mockPrisma.service.findFirst.mockResolvedValue(null);
            mockPrisma.slugRedirect.findUnique.mockResolvedValue({
                entityType: 'service',
                fromSlug: 'old-audit',
                toSlug: 'external-audit',
            });

            const service = new GetServiceBySlugService(mockPrisma);
            const result = await service.getBySlugWeb('old-audit', 'ar');
            expect(result).toEqual({ redirectTo: 'external-audit' });
        });

        it('returns detail when published service exists', async () => {
            mockPrisma.service.findFirst.mockResolvedValue({
                id: 's-1',
                slug: 'external-audit',
                isPublished: true,
                translations: [{ language: 'ar', title: 'التدقيق الخارجي', summary: 'ملخص' }],
                sectors: [],
                faqs: [],
            });

            const service = new GetServiceBySlugService(mockPrisma);
            const result = await service.getBySlugWeb('external-audit', 'ar');
            expect(result.title).toBe('التدقيق الخارجي');
        });
    });

    describe('PublishServiceService', () => {
        it('rejects publishing when Arabic title or summary is missing', async () => {
            mockPrisma.service.findUnique.mockResolvedValue({
                id: 's-1',
                translations: [{ language: 'ar', title: '', summary: '' }],
            });

            const service = new PublishServiceService(mockPrisma);
            await expect(service.publish('s-1', true)).rejects.toThrow(BadRequestException);
        });

        it('successfully publishes when Arabic title and summary are present', async () => {
            mockPrisma.service.findUnique.mockResolvedValue({
                id: 's-1',
                translations: [{ language: 'ar', title: 'عنوان', summary: 'ملخص' }],
            });
            mockPrisma.service.update.mockResolvedValue({ id: 's-1', isPublished: true });

            const service = new PublishServiceService(mockPrisma);
            const result = await service.publish('s-1', true);
            expect(result.isPublished).toBe(true);
        });
    });

    describe('DeleteServiceService', () => {
        it('throws 409 ConflictException when service is referenced by leads or articles', async () => {
            mockPrisma.service.findUnique.mockResolvedValue({ id: 's-1', isDeleted: false });
            mockPrisma.contact.count.mockResolvedValue(3); // 3 leads reference this service

            const service = new DeleteServiceService(mockPrisma);
            await expect(service.delete('s-1')).rejects.toThrow(ConflictException);
        });

        it('soft-deletes when not referenced', async () => {
            mockPrisma.service.findUnique.mockResolvedValue({ id: 's-1', isDeleted: false });
            mockPrisma.contact.count.mockResolvedValue(0);
            mockPrisma.articleService.count.mockResolvedValue(0);
            mockPrisma.service.update.mockResolvedValue({ id: 's-1', isDeleted: true });

            const service = new DeleteServiceService(mockPrisma);
            await service.delete('s-1');
            expect(mockPrisma.service.update).toHaveBeenCalledWith({
                where: { id: 's-1' },
                data: expect.objectContaining({ isDeleted: true }),
            });
        });
    });

    describe('UpdateServiceService', () => {
        it('writes to SlugRedirect table when slug changes', async () => {
            mockPrisma.service.findUnique.mockResolvedValue({
                id: 's-1',
                slug: 'old-slug',
            });
            mockPrisma.service.update.mockResolvedValue({
                id: 's-1',
                slug: 'new-slug',
                translations: [],
            });

            const service = new UpdateServiceService(mockPrisma);
            await service.update('s-1', {
                slug: 'new-slug',
                title: { ar: 'عنوان', en: 'Title' },
                summary: { ar: 'ملخص', en: 'Summary' },
            } as any);

            expect(mockPrisma.slugRedirect.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        entityType_fromSlug: {
                            entityType: 'service',
                            fromSlug: 'old-slug',
                        },
                    },
                    create: expect.objectContaining({
                        entityType: 'service',
                        fromSlug: 'old-slug',
                        toSlug: 'new-slug',
                    }),
                }),
            );
        });
    });
});
