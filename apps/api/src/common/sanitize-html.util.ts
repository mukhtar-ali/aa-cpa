import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
        'sub', 'sup', 'code', 'pre',
        'ul', 'ol', 'li',
        'blockquote', 'hr', 'div', 'span',
        'a', 'img',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'article', 'section', 'header', 'footer', 'aside', 'nav',
        'wbr',
    ],
    allowedAttributes: {
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        '*': ['data-*'],
    },
    // Drop empty spacer paragraphs, but NOT ones that hold media: an image has no text, so the
    // text-only check used to delete every <p><img ...></p> the editor produced (MUK-469).
    exclusiveFilter: (frame) =>
        frame.tag === 'p' && !(frame.text || '').trim() && frame.mediaChildren.length === 0,
    transformTags: {
        a: (tagName, attribs) => {
            const href = attribs.href;
            if (href && !href.startsWith('#') && !href.startsWith('/')) {
                attribs.target = '_blank';
                attribs.rel = 'noopener noreferrer';
            }
            if (href && /^(javascript|vbscript|data):/i.test(href)) {
                delete attribs.href;
            }
            return { tagName, attribs };
        },
        img: (tagName, attribs) => {
            if (attribs.src && /^(javascript|vbscript|data):/i.test(attribs.src)) {
                delete attribs.src;
            }
            return { tagName, attribs };
        },
    },
};

/**
 * Sanitizes CKEditor-authored HTML before persisting it. Called at the service layer on
 * every create/update so anything already in the DB (and therefore anything rendered on the
 * public site via dangerouslySetInnerHTML) is trusted-safe with no render-time sanitization
 * pass needed.
 */
export function sanitizeRichText(html: string | undefined | null): string {
    if (!html) return '';
    try {
        return sanitizeHtml(html, SANITIZE_OPTIONS);
    } catch {
        return '';
    }
}
