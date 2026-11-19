import {
    getDefaultJobForm,
    getDefaultNewsForm,
    JobFormSchema,
    NewsFormSchema,
} from '@repo/shared';

// The admin could save an entity with no title at all (the multi-language field
// accepted empty strings), leaving blank rows in every list. Arabic is now mandatory; English stays optional.

const cases = [
    ['news', NewsFormSchema, getDefaultNewsForm],
    ['job', JobFormSchema, () => ({ ...getDefaultJobForm(), departmentId: 'dept-1' })],
] as const;

describe.each(cases)('%s form: title', (_name, schema, makeDefault) => {
    const withTitle = (title: { en: string; ar: string }) => ({ ...makeDefault(), title });

    it('rejects an empty or whitespace-only Arabic title, with a clear message', () => {
        for (const ar of ['', '   ']) {
            const result = schema.safeParse(withTitle({ en: 'Hello', ar }));
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some((i) => i.path.join('.') === 'title.ar' && /Arabic title is required/.test(i.message))).toBe(true);
            }
        }
    });

    it('accepts an Arabic title with an empty English one', () => {
        expect(schema.safeParse(withTitle({ en: '', ar: 'عنوان' })).success).toBe(true);
    });
});
