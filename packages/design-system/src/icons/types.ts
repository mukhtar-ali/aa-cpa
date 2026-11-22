import type * as React from 'react';

export interface IconComponentProps extends React.SVGProps<SVGSVGElement> {
  /** Accessible name. When set, the icon is exposed as an image; otherwise it is decorative. */
  title?: string;
}

export type IconComponent = React.ForwardRefExoticComponent<IconComponentProps & React.RefAttributes<SVGSVGElement>>;
