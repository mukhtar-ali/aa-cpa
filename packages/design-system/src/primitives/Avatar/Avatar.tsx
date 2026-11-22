import * as React from 'react';
import { cn } from '../../lib/cn';
import type { ImageRef } from '../../types';

const sizes = { sm: 'size-10 text-body-sm', md: 'size-14 text-body-md' } as const;

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  image?: ImageRef;
  /** Person name; used for the initials fallback. */
  name: string;
  size?: keyof typeof sizes;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = Array.from(parts[0] ?? '')[0] ?? '';
  const last = parts.length > 1 ? (Array.from(parts[parts.length - 1] ?? '')[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/**
 * Round avatar: photo, or initials when no image (md = 56 px as in the Figma testimonial).
 *
 * @figma 411:3878
 */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(({ image, name, size = 'md', className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-pine-200 font-bold text-text-heading', sizes[size], className)}
    {...props}
  >
    {image ? (
      /* plain <img>: the library is framework-agnostic; apps decide on next/image */
      <img src={image.src} alt={image.decorative ? "" : image.alt || name} width={image.width} height={image.height} className="size-full object-cover" />
    ) : (
      <span role="img" aria-label={name}>
        {initials(name)}
      </span>
    )}
  </span>
));
Avatar.displayName = 'Avatar';
