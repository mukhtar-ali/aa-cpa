import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['section-sm', 'section-md', 'section-lg', 'section-xl'],
    },
    classGroups: {
      'font-size': [
        {
          text: [
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'body-lg',
            'body-md',
            'body-sm',
            'body-xs',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return customTwMerge(clsx(inputs));
}
