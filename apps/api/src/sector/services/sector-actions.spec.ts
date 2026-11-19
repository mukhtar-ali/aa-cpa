import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateSectorService } from './create-sector.service';
import { DeleteSectorService } from './delete-sector.service';
import { GetSectorBySlugService } from './get-sector-by-slug.service';
import { ListSectorsService } from './list-services.service';
import { PublishSectorService } from './publish-sector.service';
import { ReorderSectorsService } from './reorder-sectors.service';
import { UpdateSectorService } from './update-sector.service';

describe('Sector Actions', () => {
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = {
            sector: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                count: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            sectorTranslation: {
                upsert: jest.fn(),
            },
            serviceSector: {
                deleteMany: jest.fn(),
                createMany: jest.fn(),
            },
            articleSector: {
                count: jest.fn().mockResolvedValue(0),
            },
            slugRedirect: {
                findUnique: jest.fn(),
                create: jest.fn(),
            },
            $transaction: jest.fn((cbOrArray) => {
                if (Array.isArray(cbOrArray)) return Promise.all(cbOrArray);
                return cbOrArray(mockPrisma);
            }),
        };
    });

    describe('PublishSectorService', () => {
        it('throws BadRequestException if publishing without Arabic title', async () => {
            const service = new PublishSectorService(mockPrisma);
            mockPrisma.sector.findUnique.mockResolvedValue({
                id: 'sec-1',
                translations: [{ language: 'ar', title: '', summary: '' }],
            });

            await expect(service.publish('sec-1', true)).rejects.toThrow(BadRequestException);
        });

        it('successfully publishes when Arabic title and summary exist', async () => {
            const service = new PublishSectorService(mockPrisma);
            mockPrisma.sector.findUnique.mockResolvedValue({
                id: 'sec-1',
                translations: [{ language: 'ar', title: 'قطاع البنوك', summary: 'ملخص' }],
            });
            mockPrisma.sector.update.mockResolvedValue({ id: 'sec-1', isPublished: true });

            const result = await service.publish('sec-1', true);
            expect(result.isPublished).toBe(true);
        });
    });

    describe('DeleteSectorService', () => {
        it('throws ConflictException when referenced by articles', async () => {
            const service = new DeleteSectorService(mockPrisma);
            mockPrisma.sector.findUnique.mockResolvedValue({ id: 'sec-1', isDeleted: false });
            mockPrisma.articleSector.count.mockResolvedValue(2);

            await expect(service.delete('sec-1')).rejects.toThrow(ConflictException);
        });

        it('soft deletes when no references exist', async () => {
            const service = new DeleteSectorService(mockPrisma);
            mockPrisma.sector.findUnique.mockResolvedValue({ id: 'sec-1', isDeleted: false });
            mockPrisma.articleSector.count.mockResolvedValue(0);
            mockPrisma.sector.update.mockResolvedValue({ id: 'sec-1', isDeleted: true });

            const result = await service.delete('sec-1');
            expect(result.isDeleted).toBe(true);
        });
    });

    describe('GetSectorBySlugService', () => {
        it('returns redirectTo when slug was redirected', async () => {
            const service = new GetSectorBySlugService(mockPrisma);
            mockPrisma.sector.findFirst.mockResolvedValue(null);
            mockPrisma.slugRedirect.findUnique.mockResolvedValue({ toSlug: 'banking' });

            const result = await service.getBySlugWeb('old-banking', 'ar');
            expect(result).toEqual({ redirectTo: 'banking' });
        });

        it('throws NotFoundException when slug does not exist', async () => {
            const service = new GetSectorBySlugService(mockPrisma);
            mockPrisma.sector.findFirst.mockResolvedValue(null);
            mockPrisma.slugRedirect.findUnique.mockResolvedValue(null);

            await expect(service.getBySlugWeb('unknown', 'ar')).rejects.toThrow(NotFoundException);
        });
    });
});
