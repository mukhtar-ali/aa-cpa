type Lang = 'en' | 'ar';

const isMultiLang = (value: unknown): value is { en?: string; ar?: string } =>
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (('ar' in value && (typeof (value as any).ar === 'string' || (value as any).ar === undefined)) ||
        ('en' in value && (typeof (value as any).en === 'string' || (value as any).en === undefined)));

function pickLangValue(ml: { en?: string; ar?: string }, lang: Lang): string {
    const val = ml[lang];
    if (val !== undefined && val !== null && val.trim() !== '') {
        return val;
    }
    // Fallback to Arabic when requested value is empty/missing
    return ml.ar ?? '';
}

/** Array items can themselves be `{ en, ar }` values (project tags, unit features); those become plain strings. */
function localizeItem(item: unknown, lang: Lang): unknown {
    return isMultiLang(item) ? pickLangValue(item, lang) : localize(item, lang);
}

/**
 * Replaces every `{ en, ar }` value in a response with the string for `lang`, at any depth, including
 * inside arrays. (Arrays of `{ en, ar }` used to be returned untouched, so the public site received objects
 * where the shared types promise strings and crashed when it rendered them, e.g. a unit's features list.)
 * Falls back to Arabic when the requested value is empty or missing.
 */
export function localize<T>(data: T, lang: Lang): T {
    if (Array.isArray(data)) {
        return data.map((item) => localizeItem(item, lang)) as T;
    }
    if (!data || typeof data !== 'object') return data;

    const result: any = {};
    for (const key in data) {
        const value = (data as any)[key];
        if (value && typeof value === 'object') {
            if (isMultiLang(value)) {
                result[key] = pickLangValue(value, lang);
            } else if (Array.isArray(value)) {
                result[key] = value.map((item) => localizeItem(item, lang));
            } else {
                result[key] = localize(value, lang);
            }
        } else {
            result[key] = value;
        }
    }
    return result;
}
