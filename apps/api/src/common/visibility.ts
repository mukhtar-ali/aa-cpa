/**
 * Public visibility filter for publishable content (FR-011, "scheduled publish").
 * An item is visible when it is published, not deleted and its publish date is empty or already
 * reached. Dates are absolute instants, so the Asia/Riyadh wall-clock time an editor picks is
 * converted by the admin form before it reaches the API.
 */
export function publishedNow(now: Date = new Date()) {
    return {
        isPublished: true,
        isDeleted: false,
        AND: [{ OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] }],
    };
}
