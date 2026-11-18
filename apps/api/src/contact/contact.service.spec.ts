import { ContactService } from './contact.service';

describe('ContactService.findAll search (MUK-470)', () => {
    let prisma: { contact: { findMany: jest.Mock; count: jest.Mock } };
    let service: ContactService;

    beforeEach(() => {
        prisma = { contact: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) } };
        service = new ContactService(prisma as never);
    });

    const whereOf = () => prisma.contact.findMany.mock.calls[0][0].where;

    it('does not filter by text when no search is given', async () => {
        await service.findAll({ pageNumber: 1, pageSize: 10 } as never);
        expect(whereOf()).toEqual({ isDeleted: false });
    });

    it('searches name, email and subject and applies it to the count too', async () => {
        await service.findAll({ pageNumber: 1, pageSize: 20, search: 'pricing' } as never);
        const expected = {
            isDeleted: false,
            OR: [{ fullName: { contains: 'pricing' } }, { email: { contains: 'pricing' } }, { subject: { contains: 'pricing' } }],
        };
        expect(whereOf()).toEqual(expected);
        expect(prisma.contact.count).toHaveBeenCalledWith({ where: expected });
    });

    it('combines the search with the status filter and ignores a blank search', async () => {
        await service.findAll({ pageNumber: 1, pageSize: 10, status: ['new'], search: ' hi ' } as never);
        expect(whereOf()).toMatchObject({ isDeleted: false, status: { in: ['new'] }, OR: expect.any(Array) });
        prisma.contact.findMany.mockClear();
        await service.findAll({ pageNumber: 1, pageSize: 10, status: ['new'], search: '' } as never);
        expect(whereOf()).toEqual({ isDeleted: false, status: { in: ['new'] } });
    });
});
