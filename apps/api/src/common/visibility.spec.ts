import { publishedNow } from './visibility';

describe('publishedNow (scheduled publish, FR-011)', () => {
    const now = new Date('2026-06-01T09:00:00.000Z'); // 12:00 Asia/Riyadh

    it('requires published, not deleted, and a publish date that is empty or reached', () => {
        expect(publishedNow(now)).toEqual({
            isPublished: true,
            isDeleted: false,
            AND: [{ OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] }],
        });
    });

    it('does not collide with a caller-supplied OR (jobs closing date)', () => {
        const where: any = { ...publishedNow(now), OR: [{ closesAt: null }] };
        expect(where.AND).toHaveLength(1);
        expect(where.OR).toEqual([{ closesAt: null }]);
    });
});
