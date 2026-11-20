import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('is a button named by its label with a decorative icon', () => {
    const { container } = render(<IconButton label="Next" icon="chevron" />);
    const el = screen.getByRole('button', { name: 'Next' });
    expect(el).toHaveAttribute('type', 'button');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['outline', 'bg-bg-surface', 'border-border-subtle'],
    ['solid', 'bg-bg-inverse', 'text-text-inverse'],
    ['ghost-light', 'bg-transparent', 'border-border-inverse'],
  ] as const)('variant %s', (variant, ...classes) => {
    render(<IconButton label="x" icon="close" variant={variant} />);
    expect(screen.getByRole('button')).toHaveClass('rounded-full', ...classes);
  });

  it('md is 48 px and sm is 40 px', () => {
    const { rerender } = render(<IconButton label="x" icon="close" />);
    expect(screen.getByRole('button')).toHaveClass('size-12');
    rerender(<IconButton label="x" icon="close" size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('size-10');
  });

  it('renders a link when href is set', () => {
    render(<IconButton label="LinkedIn" icon="linkedin" href="https://example.com" />);
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://example.com');
  });

  it('external links open in a new tab safely', () => {
    render(<IconButton label="LinkedIn" icon="linkedin" href="https://example.com" external />);
    const el = screen.getByRole('link', { name: 'LinkedIn' });
    expect(el).toHaveAttribute('target', '_blank');
    expect(el).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('disabled blocks clicks and sets aria-disabled', async () => {
    const onClick = vi.fn();
    render(<IconButton label="x" icon="close" disabled onClick={onClick} />);
    const el = screen.getByRole('button');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('reverseIcon flips the icon for "previous"', () => {
    const { container } = render(<IconButton label="Prev" icon="chevron" reverseIcon />);
    expect(container.querySelector('svg')).toHaveClass('-scale-x-100', 'rtl:scale-x-100');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <IconButton label={lang === 'ar' ? 'التالي' : 'Next'} icon="chevron" variant="solid" />
        <IconButton label={lang === 'ar' ? 'السابق' : 'Previous'} icon="chevron" reverseIcon />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
