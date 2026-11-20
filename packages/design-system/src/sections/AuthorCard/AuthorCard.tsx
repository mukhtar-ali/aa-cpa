import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../primitives/Avatar';
import type { Author } from '../../types';

export interface AuthorCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  author: Author;
}

/**
 * Author card (Figma 506:4076): white card, 24 px radius, 1 px subtle border, 56 px avatar, bold name, muted role and a short bio.
 *
 * @figma 506:4076
 */
export const AuthorCard = React.forwardRef<HTMLElement, AuthorCardProps>(({ author, className, ...props }, ref) => (
  <aside ref={ref} className={cn('flex flex-col gap-5 rounded-cta border border-solid border-border-subtle bg-bg-surface p-6', className)} {...props}>
    <div className="flex items-center gap-4">
      <Avatar name={author.name} image={author.avatar} />
      <div className="flex flex-col">
        <p className="text-body-md font-bold text-text-heading">{author.name}</p>
        {author.role ? <p className="text-body-sm text-text-muted">{author.role}</p> : null}
      </div>
    </div>
    {author.bio ? <p className="text-body-sm text-text-body">{author.bio}</p> : null}
  </aside>
));
AuthorCard.displayName = 'AuthorCard';
