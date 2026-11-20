import * as React from 'react';
import onDark from '../../../assets/brand/logo-on-dark.svg';
import onLight from '../../../assets/brand/logo-on-light.svg';

type Asset = string | { src: string };
const toSrc = (asset: Asset): string => (typeof asset === 'string' ? asset : asset.src);

export interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  /** `on-dark` for dark sections, `on-light` for the page background. */
  variant: 'on-dark' | 'on-light';
  /** Accessible name, for example the company name. */
  label: string;
}

/**
 * Brand logo (Figma 65:56 on dark, 78:197 on light), 237 x 60 at native size. The SVGs are referenced as assets so the brand
 * colours stay out of component source. Wrap in a link to the home page in headers and footers.
 *
 * @figma 65:56, 78:197
 */
export const Logo = React.forwardRef<HTMLImageElement, LogoProps>(({ variant, label, className, ...props }, ref) => (
  <img
    ref={ref}
    src={toSrc(variant === 'on-dark' ? (onDark as Asset) : (onLight as Asset))}
    alt={label}
    width={237}
    height={60}
    className={className}
    {...props}
  />
));
Logo.displayName = 'Logo';
