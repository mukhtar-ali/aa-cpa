import type { SanitizedHtml } from '../types';

/**
 * Declares that `html` was sanitised on the server. Call it only on API data that went through the API's sanitiser (sanitize-html on
 * write); never on user input or on text from a source that is not sanitised. The function does not sanitise anything itself.
 */
export function markSanitizedHtml(html: string): SanitizedHtml {
  return html as SanitizedHtml;
}
