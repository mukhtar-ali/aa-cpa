export type SupportedLocale = 'ar' | 'en';

const LOCALE_TAGS: Record<SupportedLocale, string> = {
  // Gregorian calendar explicitly: the default calendar of the SA region is Umm al-Qura (Hijri years).
  ar: 'ar-SA-u-ca-gregory-nu-latn',
  en: 'en-SA-u-ca-gregory',
};

export function formatNumber(
  value: number,
  locale: SupportedLocale = 'ar',
  options?: Intl.NumberFormatOptions,
): string {
  const tag = LOCALE_TAGS[locale] ?? LOCALE_TAGS.ar;
  // NaN and Infinity would print as "NaN" or "∞" on the page.
  if (!Number.isFinite(value)) return '–';
  return new Intl.NumberFormat(tag, options).format(value);
}

export function formatCurrency(
  value: number,
  locale: SupportedLocale = 'ar',
  currency = 'SAR',
  options?: Intl.NumberFormatOptions,
): string {
  const tag = LOCALE_TAGS[locale] ?? LOCALE_TAGS.ar;
  if (!Number.isFinite(value)) return '–';
  try {
    return new Intl.NumberFormat(tag, {
      style: 'currency',
      currency,
      ...options,
    }).format(value);
  } catch {
    // An invalid currency code throws a RangeError; show the number with the code instead of crashing the page.
    return `${new Intl.NumberFormat(tag, options).format(value)} ${currency}`;
  }
}

export function formatDate(
  date: Date | string | number,
  locale: SupportedLocale = 'ar',
  options?: Intl.DateTimeFormatOptions,
): string {
  const tag = LOCALE_TAGS[locale] ?? LOCALE_TAGS.ar;
  const d = typeof date === 'object' ? date : new Date(date);
  const defaultOptions: Intl.DateTimeFormatOptions = options ?? {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat(tag, defaultOptions).format(d);
}
