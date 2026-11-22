import * as React from 'react';
import { cn } from '../lib/cn';
import { iconMeta, iconRegistry, type IconName } from './generated';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name' | 'title'> {
  name: IconName;
  /** Accessible name. Without it the icon is decorative (`aria-hidden`). */
  title?: string;
  /** Rendered size in px. Defaults to the icon's native Figma size so stroke widths match the design. */
  size?: number;
  /** Force mirroring in RTL on/off. Defaults to true only for directional icons (arrows, chevrons). */
  mirror?: boolean;
  /** Point the opposite way ("previous"): flipped in LTR, back to the drawn shape in RTL. Directional icons only. */
  reverse?: boolean;
}

/**
 * Renders a named icon from the Figma icon set. Colours follow `currentColor` (accent fills use tokens).
 *
 * @figma 411:3741, 411:3748, 411:3763, 411:3707, 527:5423, 505:3864, 529:4333, 522:1214
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(({ name, title, size, mirror, reverse = false, className, ...props }, ref) => {
  const Component = iconRegistry[name];
  const meta = iconMeta[name];
  if (!Component || !meta) return null;
  const px = size ?? meta.size;
  const shouldMirror = !reverse && (mirror ?? meta.directional);
  return (
    <Component
      ref={ref}
      width={px}
      height={px}
      title={title}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn('shrink-0', shouldMirror && 'rtl:-scale-x-100', reverse && '-scale-x-100 rtl:scale-x-100', className)}
      {...props}
    />
  );
});
Icon.displayName = 'Icon';
