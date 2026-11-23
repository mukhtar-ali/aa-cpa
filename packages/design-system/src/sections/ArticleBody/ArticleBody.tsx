import * as React from 'react';
import { cn } from '../../lib/cn';
import { Chip } from '../../primitives/Chip';

export interface ArticleBodyProps extends React.HTMLAttributes<HTMLElement> {
  /** Tags shown under the text as chips. */
  tags?: string[];
  /** Accessible name of the tag list, for example "Tags". */
  tagsLabel?: string;
}

/**
 * Article body (Figma 506:2706 article card): wraps prose content in `.ds-prose` (intro paragraph, numbered H2 at the H3 size, paragraphs,
 * lists with emerald dots, `<blockquote>` as the dark pull-quote card with `<cite>`, `<figure>` with `<figcaption>`) and a row of tag chips.
 * Pass sanitised HTML/React content as children; headings that are linked from the table of contents need an `id`.
 *
 * @figma 506:2706, 509:3025
 */
export const ArticleBody = React.forwardRef<HTMLElement, ArticleBodyProps>(({ tags, tagsLabel, className, children, ...props }, ref) => (
  <article ref={ref} className={cn('flex flex-col gap-10', className)} {...props}>
    <div className="ds-prose">{children}</div>
    {tags && tags.length > 0 ? (
      <ul aria-label={tagsLabel} className="flex flex-wrap gap-3">
        {tags.map((tag, tagIndex) => (
          <li key={`${tag}-${tagIndex}`}>
            <Chip>{tag}</Chip>
          </li>
        ))}
      </ul>
    ) : null}
  </article>
));
ArticleBody.displayName = 'ArticleBody';
