import * as React from 'react';

export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

/**
 * A heading element of a chosen level. Cards render their title with this so a page can keep a correct outline: a card list under an
 * H2 section heading uses level 3, a list directly under the page H1 would use level 2.
 */
export function HeadingTag({ level = 3, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { level?: HeadingLevel }) {
  const Tag = `h${level}` as 'h3';
  return <Tag {...props} />;
}
