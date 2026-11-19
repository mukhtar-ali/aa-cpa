import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetAllNewsService } from './get-all-news.service';
import { GetNewsBySlugService } from './get-news-by-slug.service';
import { ArticleCategoriesService } from '../categories/article-categories.service';
import { AuthorsService } from '../authors/authors.service';

describe('News Actions & Filters', () => {
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = {
            news: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                count: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            articleCategory: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                count: jest.fn(),
            },
            author: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                count: jest.fn(),
            },
            slugRedirect: {
                findUnique: jest.fn(),
            },
            $transaction: jest.fn((cbOrArr) => (Array.isArray(cbOrArr) ? Promise.all(cbOrArr) : cbOrArr(mockPrisma))),
        };
    });

    describe('GetAllNewsService filters', () => {
        it('applies category, sector, service and featured filters', async () => {
            const service = new GetAllNewsService(mockPrisma);
            mockPrisma.news.findMany.mockResolvedValue([]);
            mockPrisma.news.count.mockResolvedValue(0);

            await service.execute(
                {
                    categoryId: 'cat-1',
                    sectorId: 'sec-1',
                    serviceId: 'serv-1',
                    isFeatured: true,
                } as any,
                true,
            );

            expect(mockPrisma.news.findMany).toHaveBeenCalled();
            const callArgs = mockPrisma.news.findMany.mock.calls[0][0];
            expect(callArgs.where.categoryId).toBe('cat-1');
            expect(callArgs.where.isFeatured).toBe(true);
            expect(callArgs.where.sectors).toEqual({ some: { sectorId: 'sec-1' } });
            expect(callArgs.where.services).toEqual({ some: { serviceId: 'serv-1' } });
            expect(callArgs.where.isPublished).toBe(true);
        });
    });

    describe('ArticleCategoriesService', () => {
        it('creates a category with valid name and slug', async () => {
            const service = new ArticleCategoriesService(mockPrisma);
            mockPrisma.articleCategory.create.mockResolvedValue({
                id: 'cat-1',
                slug: 'tax',
                name: { ar: 'ضرائب', en: 'Tax' },
                order: 0,
                isCaseStory: false,
                isDeleted: false,
            });

            const result = await service.create({
                slug: 'tax',
                name: { ar: 'ضرائب', en: 'Tax' },
                order: 0,
                isCaseStory: false,
            });

            expect(result.id).toBe('cat-1');
            expect(result.slug).toBe('tax');
        });

        it('prevents deletion if articles reference category', async () => {
            const service = new ArticleCategoriesService(mockPrisma);
            mockPrisma.articleCategory.findUnique.mockResolvedValue({ id: 'cat-1', isDeleted: false });
            mockPrisma.news.count.mockResolvedValue(3);

            await expect(service.delete('cat-1')).rejects.toThrow();
        });
    });

    describe('AuthorsService', () => {
        it('creates an author with name and role', async () => {
            const service = new AuthorsService(mockPrisma);
            mockPrisma.author.create.mockResolvedValue({
                id: 'auth-1',
                name: { ar: 'محمد', en: 'Mohammed' },
                role: { ar: 'مستشار', en: 'Advisor' },
                bio: { ar: 'سيرة', en: 'Bio' },
                avatar: null,
                order: 0,
                isDeleted: false,
            });

            const result = await service.create({
                name: { ar: 'محمد', en: 'Mohammed' },
                role: { ar: 'مستشار', en: 'Advisor' },
                order: 0,
            });

            expect(result.id).toBe('auth-1');
        });
    });
});
