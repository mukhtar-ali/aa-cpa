import {
    getDefaultJobForm, getDefaultNewsForm, getDefaultProjectForm, getDefaultUnit,
    JobFormSchema, NewsFormSchema, ProjectFormSchema, UnitFormSchema,
} from '@repo/shared';

// The admin could save a news article / project / job / unit with no title at all (the multi-language field
// accepted empty strings), leaving blank rows in every list. English is now mandatory; Arabic stays optional.

const cases = [
    ['news', NewsFormSchema, getDefaultNewsForm],
    ['project', ProjectFormSchema, getDefaultProjectForm],
    ['job', JobFormSchema, getDefaultJobForm],
    ['unit', UnitFormSchema, getDefaultUnit],
] as const;

describe.each(cases)('%s form: title', (_name, schema, makeDefault) => {
    const withTitle = (title: { en: string; ar: string }) => ({ ...makeDefault(), title });

    it('rejects an empty or whitespace-only English title, with a clear message', () => {
        for (const en of ['', '   ']) {
            const result = schema.safeParse(withTitle({ en, ar: 'عنوان' }));
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some((i) => i.path.join('.') === 'title.en' && /English title is required/.test(i.message))).toBe(true);
            }
        }
    });

    it('accepts an English title with an empty Arabic one', () => {
        expect(schema.safeParse(withTitle({ en: 'Hello', ar: '' })).success).toBe(true);
    });
});
