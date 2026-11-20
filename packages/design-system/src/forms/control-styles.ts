import { cva } from 'class-variance-authority';

/**
 * Shared look of text controls (Figma input 522:1185): 56 px high, 12 px radius, 1 px border; focus and error use the 1.5 px
 * border with a ring. State styling hangs off native/aria attributes so it also works on plain elements: focus-visible,
 * `aria-invalid="true"`, placeholder-shown (empty) vs filled.
 */
export const controlVariants = cva(
  [
    'box-border w-full rounded-field border border-solid text-body-md outline-none',
    'transition-[border-color,background-color,box-shadow] duration-(--motion-duration-fast) ease-standard',
    'disabled:cursor-not-allowed disabled:opacity-60',
    'focus-visible:border-(length:--border-width-focus) focus-visible:ring-3',
  ],
  {
    variants: {
      theme: {
        light: [
          'border-neutral-200 bg-neutral-0 text-text-heading placeholder:text-neutral-500',
          'not-placeholder-shown:bg-neutral-50',
          'focus-visible:border-emerald-600 focus-visible:bg-neutral-0 focus-visible:ring-ring-focus',
          'aria-[invalid=true]:border-(length:--border-width-focus) aria-[invalid=true]:border-status-error aria-[invalid=true]:bg-neutral-50 aria-[invalid=true]:ring-3 aria-[invalid=true]:ring-ring-error',
        ],
        dark: [
          'rounded-none border-border-inverse-strong bg-bg-inverse-raised text-text-inverse placeholder:text-text-inverse-muted',
          'focus-visible:border-text-inverse focus-visible:ring-bg-inverse-raised',
          'aria-[invalid=true]:border-status-error',
        ],
      },
      kind: {
        text: 'h-14 px-4',
        textarea: 'min-h-32.5 resize-y px-4 py-4',
      },
    },
    compoundVariants: [{ theme: 'dark', kind: 'text', className: 'h-auto px-6 py-4 text-h4 text-end' }],
    defaultVariants: { theme: 'light', kind: 'text' },
  },
);
