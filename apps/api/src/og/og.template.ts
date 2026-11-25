/** Fonts installed in the API image (apps/api/Dockerfile: fonts-noto-core); the generic family is the fallback on a dev machine. */
export const FONT_STACK = "Noto Naskh Arabic, Noto Sans Arabic, Noto Sans, DejaVu Sans, sans-serif";

export interface RenderOgSvgOptions {
    title: string;
    eyebrow?: string;
    lang: 'ar' | 'en';
}

export function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Splits title text into multiple lines when it exceeds maxCharsPerLine.
 * Truncates with an ellipsis if it exceeds maxLines.
 */
export function wrapTitle(title: string, maxCharsPerLine = 32, maxLines = 3): string[] {
    const trimmed = title.trim();
    if (!trimmed) return [''];
    const words = trimmed.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if (!currentLine) {
            currentLine = word;
        } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
            if (lines.length === maxLines - 1) {
                break;
            }
        }
    }

    if (currentLine && lines.length < maxLines) {
        lines.push(currentLine);
    }

    const consumedWords = lines.reduce((acc, l) => acc + l.split(/\s+/).filter(Boolean).length, 0);
    if (consumedWords < words.length) {
        const lastIdx = lines.length - 1;
        let last = lines[lastIdx];
        if (last.length > maxCharsPerLine - 2) {
            last = last.slice(0, maxCharsPerLine - 2).trim();
        }
        lines[lastIdx] = last + '…';
    }

    return lines;
}

const BRAND_MARK_PATH =
    'm37.542 6.64-10.628 6.126-11.747 6.763a6.94 6.94 0 0 0-3.469 6.003v3.903L0 22.696V18.99a6.94 6.94 0 0 1 3.469-6.002l13.383-7.709L26.041 0l11.513 6.628zm14.503 25.103v13.282L26.04 60.012l-11.514-6.64zm4.859-13.944-8.414 4.836-33.323 19.198a6.92 6.92 0 0 0-3.469 5.99v3.928L0 45.012v-3.719a6.92 6.92 0 0 1 3.469-5.99l8.23-4.75 23.973-13.81 9.694-5.585z';

export function renderOgSvg({ title, eyebrow, lang }: RenderOgSvgOptions): string {
    const isAr = lang === 'ar';
    const lines = wrapTitle(title, isAr ? 30 : 30, 3);
    const escapedLines = lines.map(escapeXml);
    const escapedEyebrow = eyebrow ? escapeXml(eyebrow) : undefined;

    const firmName = isAr
        ? 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية'
        : 'Abdulrahman Al-Shubaishiri Professional Consulting';
    const firmSubtitle = isAr
        ? 'محاسبون ومراجعون قانونيون · ترخيص رقم 522'
        : 'Certified Public Accountants & Consultants · SOCPA License 522';
    const networkBadge = isAr ? 'عضو شبكة 3E العالمية للمحاسبة' : 'Member of 3E Accounting Network';

    const dir = isAr ? 'rtl' : 'ltr';
    // librsvg already mirrors start/end for direction="rtl" (start = the right edge), so the LOGICAL anchors are the same for both languages.
    const anchor = 'start';
    const textX = isAr ? 1110 : 90;
    const headerTextX = isAr ? 1030 : 165;
    const markX = isAr ? 1053 : 90;

    const titleStartY = escapedEyebrow ? 310 : 280;
    const lineHeight = 66;

    const tspans = escapedLines
        .map((line, idx) => `<tspan x="${textX}" dy="${idx === 0 ? 0 : lineHeight}">${line}</tspan>`)
        .join('');

    return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#238b68"/>
      <stop offset="100%" stop-color="#2d9bc8"/>
    </linearGradient>
    <linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#164c62" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#030d1a" stop-opacity="0.8"/>
    </linearGradient>
  </defs>

  <!-- Deep brand hero background -->
  <rect width="100%" height="100%" fill="#030d1a"/>

  <!-- Subtle card surface outline -->
  <rect x="40" y="40" width="1120" height="550" rx="20" fill="url(#cardGlow)" stroke="#164c62" stroke-width="1.5" stroke-opacity="0.4"/>

  <!-- Brand bottom gradient line -->
  <rect x="0" y="618" width="1200" height="12" fill="url(#brandGradient)"/>

  <!-- Header Section -->
  <g transform="translate(${markX}, 65)">
    <path fill="#51a584" d="${BRAND_MARK_PATH}"/>
  </g>
  <text x="${headerTextX}" y="90" text-anchor="${anchor}" font-family="${FONT_STACK}" font-size="24" font-weight="bold" fill="#ffffff" direction="${dir}">
    ${escapeXml(firmName)}
  </text>
  <text x="${headerTextX}" y="118" text-anchor="${anchor}" font-family="${FONT_STACK}" font-size="16" fill="#77c0a1" direction="${dir}">
    ${escapeXml(firmSubtitle)}
  </text>

  <!-- Eyebrow Badge (if present) -->
  ${
      escapedEyebrow
          ? `<text x="${textX}" y="240" text-anchor="${anchor}" font-family="${FONT_STACK}" font-size="22" font-weight="600" fill="#2d9bc8" direction="${dir}">${escapedEyebrow}</text>`
          : ''
  }

  <!-- Main Title -->
  <text x="${textX}" y="${titleStartY}" text-anchor="${anchor}" font-family="${FONT_STACK}" font-size="52" font-weight="bold" fill="#efecdf" direction="${dir}">
    ${tspans}
  </text>

  <!-- Footer Section -->
  <text x="${isAr ? 90 : 1110}" y="555" text-anchor="end" font-family="${FONT_STACK}" font-size="18" fill="#a9b0aa" direction="${dir}">
    ${escapeXml(networkBadge)}
  </text>
  <text x="${textX}" y="555" text-anchor="${isAr ? 'end' : 'start'}" font-family="${FONT_STACK}" font-size="22" font-weight="bold" fill="#51a584">
    aacpa.sa
  </text>
</svg>`;
}
