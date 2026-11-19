import { OfficesService } from './offices.service';
import { TestimonialsService } from './testimonials.service';
import { ClientLogosService } from './client-logos.service';
import { CredentialsService } from './credentials.service';
import { FaqsService } from './faqs.service';

describe('Reference Entities Actions', () => {
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = {
            office: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            testimonial: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            clientLogo: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            credential: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            faqItem: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            $transaction: jest.fn((cbOrArr) => (Array.isArray(cbOrArr) ? Promise.all(cbOrArr) : cbOrArr(mockPrisma))),
        };
    });

    it('OfficesService lists published offices ordered by order', async () => {
        const service = new OfficesService(mockPrisma);
        mockPrisma.office.findMany.mockResolvedValue([]);
        await service.listWeb('ar');
        expect(mockPrisma.office.findMany).toHaveBeenCalledWith({
            where: { isPublished: true, isDeleted: false },
            orderBy: { order: 'asc' },
        });
    });

    it('TestimonialsService filters by placement', async () => {
        const service = new TestimonialsService(mockPrisma);
        mockPrisma.testimonial.findMany.mockResolvedValue([]);
        await service.listWeb('ar', 'home');
        expect(mockPrisma.testimonial.findMany).toHaveBeenCalled();
    });

    it('FaqsService filters by scope and serviceId', async () => {
        const service = new FaqsService(mockPrisma);
        mockPrisma.faqItem.findMany.mockResolvedValue([]);
        await service.listWeb('ar', 'service', 'serv-1');
        expect(mockPrisma.faqItem.findMany).toHaveBeenCalledWith({
            where: {
                isPublished: true,
                isDeleted: false,
                scope: 'service',
                serviceId: 'serv-1',
            },
            orderBy: { order: 'asc' },
        });
    });
});
