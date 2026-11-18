import { InquiryService } from './inquiry.service';

describe('InquiryService.findAll search (MUK-470)', () => {
    let prisma: { inquiry: { findMany: jest.Mock; count: jest.Mock } };
    let service: InquiryService;

    beforeEach(() => {
        prisma = { inquiry: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) } };
        service = new InquiryService(prisma as never);
    });

    const whereOf = () => prisma.inquiry.findMany.mock.calls[0][0].where;

    it('does not filter by text when no search is given', async () => {
        await service.findAll({ pageNumber: 1, pageSize: 10 } as never);
        expect(whereOf()).toEqual({ isDeleted: false });
    });

    it('searches name, email and phone, and applies the same filter to the total count', async () => {
        await service.findAll({ pageNumber: 2, pageSize: 5, search: 'john' } as never);
        const expected = {
            isDeleted: false,
            OR: [{ fullName: { contains: 'john' } }, { email: { contains: 'john' } }, { phone: { contains: 'john' } }],
        };
        expect(whereOf()).toEqual(expected);
        expect(prisma.inquiry.count).toHaveBeenCalledWith({ where: expected });
        expect(prisma.inquiry.findMany.mock.calls[0][0]).toMatchObject({ skip: 5, take: 5 });
    });

    it('trims the search and ignores a blank one', async () => {
        await service.findAll({ pageNumber: 1, pageSize: 10, search: '  ann  ' } as never);
        expect(whereOf().OR[0]).toEqual({ fullName: { contains: 'ann' } });
        prisma.inquiry.findMany.mockClear();
        await service.findAll({ pageNumber: 1, pageSize: 10, search: '   ' } as never);
        expect(whereOf()).toEqual({ isDeleted: false });
    });

    it('still combines the search with the project filter', async () => {
        await service.findAll({ pageNumber: 1, pageSize: 10, search: 'x', projectId: 'p-1' } as never);
        expect(whereOf()).toMatchObject({ isDeleted: false, projectId: 'p-1', OR: expect.any(Array) });
    });
});
