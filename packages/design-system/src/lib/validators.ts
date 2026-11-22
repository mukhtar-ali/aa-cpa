/** Saudi mobile: 05xxxxxxxx, 5xxxxxxxx, +9665xxxxxxxx or 009665xxxxxxxx (spaces and dashes allowed; Arabic-Indic digits are converted). */
export function normalizeDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export function isSaudiMobile(value: string): boolean {
  const cleaned = normalizeDigits(value).replace(/[\s-]/g, '');
  return /^(?:(?:\+|00)?966|0)?5\d{8}$/.test(cleaned);
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
