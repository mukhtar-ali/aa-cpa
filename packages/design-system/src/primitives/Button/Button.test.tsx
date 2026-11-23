import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from './Button';

const variants = ['primary', 'secondary', 'paper', 'link'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

describe('Button', () => {
  it('renders a native button of type button by default', () => {
    render(<Button>Go</Button>);
    const el = screen.getByRole('button', { name: 'Go' });
    expect(el.tagName).toBe('BUTTON');
    expect(el).toHaveAttribute('type', 'button');
  });

  describe.each(variants)('variant %s', (variant) => {
    it.each(sizes)('size %s renders with its classes', (size) => {
      render(
        <Button variant={variant} size={size}>
          Label
        </Button>,
      );
      const el = screen.getByRole('button');
      expect(el).toHaveClass('rounded-button');
      if (variant !== 'link') expect(el).toHaveClass({ sm: 'min-h-11', md: 'min-h-12', lg: 'min-h-13' }[size]);
    });
  });

  it('md is the 48 px homepage button and lg the 52 px one', () => {
    const { rerender } = render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-12', 'px-6', 'py-2.5');
    rerender(<Button size="lg">Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-13', 'px-8', 'py-3');
  });

  it('sm is the header call-to-action: 13 px label, 43-44 px high', () => {
    render(<Button size="sm">Quote</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-11', 'px-5', 'text-body-sm');
    expect(screen.getByRole('button')).not.toHaveClass('text-body-md');
  });

  it('secondary and paper match the beige Figma buttons (411:3709, 411:3735)', () => {
    const { rerender } = render(<Button variant="secondary">Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-bg-page', 'text-text-link', 'font-bold', 'shadow-button-primary');
    rerender(<Button variant="paper">Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-bg-page', 'text-text-strong', 'font-extrabold');
  });

  it('link renders a large-text gradient label (R4) without a box', () => {
    render(<Button variant="link">More</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-transparent', 'px-0', 'text-body-lg');
    expect(screen.getByText('More')).toHaveClass('bg-clip-text', 'text-transparent', 'to-gradient-end-text-large');
  });

  it('primary uses the action token colours and the button shadow', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-action-primary', 'text-text-on-action', 'shadow-button-primary');
  });

  it('renders an anchor when href is provided', () => {
    render(<Button href="/contact">Contact</Button>);
    const el = screen.getByRole('link', { name: 'Contact' });
    expect(el).toHaveAttribute('href', '/contact');
  });

  it('disabled sets aria-disabled and blocks clicks', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Off
      </Button>,
    );
    const el = screen.getByRole('button');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading sets aria-busy and aria-disabled, shows a spinner and blocks clicks', async () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const el = screen.getByRole('button');
    expect(el).toHaveAttribute('aria-busy', 'true');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    expect(container.querySelector('.animate-spin')).toHaveAttribute('aria-hidden', 'true');
    await userEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick when enabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is reachable and activatable with the keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled anchor drops its href and stays a labelled link', () => {
    render(
      <Button href="/x" disabled>
        Off
      </Button>,
    );
    const el = screen.getByRole('link', { name: 'Off' });
    expect(el).not.toHaveAttribute('href');
    expect(el).toHaveAttribute('aria-disabled', 'true');
  });

  it('end icon mirrors in RTL by default and can opt out; start icon never mirrors', () => {
    const { rerender } = render(
      <Button startIcon={<i data-testid="start" />} endIcon={<i data-testid="end" />}>
        Next
      </Button>,
    );
    expect(screen.getByTestId('end').parentElement).toHaveClass('rtl:-scale-x-100');
    expect(screen.getByTestId('start').parentElement).not.toHaveClass('rtl:-scale-x-100');
    rerender(
      <Button endIcon={<i data-testid="end" />} mirrorEndIcon={false}>
        Next
      </Button>,
    );
    expect(screen.getByTestId('end').parentElement).not.toHaveClass('rtl:-scale-x-100');
  });

  it('asChild applies button styling to the child element', () => {
    render(
      <Button asChild variant="secondary">
        <a href="/routed">Routed</a>
      </Button>,
    );
    const el = screen.getByRole('link', { name: 'Routed' });
    expect(el).toHaveAttribute('href', '/routed');
    expect(el).toHaveClass('rounded-button', 'text-text-link', 'bg-bg-page');
  });

  it('merges className and forwards ref', () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <Button className="w-full" ref={ref}>
        Go
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass('w-full');
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it.each(['ar', 'en'])('has no axe violations in %s for every variant, link and disabled state', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {variants.map((v) => (
          <Button key={v} variant={v}>
            {lang === 'ar' ? 'أعرف المزيد' : 'Learn more'}
          </Button>
        ))}
        <Button href="/x">{lang === 'ar' ? 'رابط' : 'Link'}</Button>
        <Button disabled>{lang === 'ar' ? 'معطل' : 'Disabled'}</Button>
        <Button loading>{lang === 'ar' ? 'جارٍ الحفظ' : 'Saving'}</Button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('a disabled asChild button does not run the child handler and has no href', async () => {
    const onClick = vi.fn();
    render(
      <Button asChild disabled>
        <a href="/x" onClick={onClick}>
          Go
        </a>
      </Button>,
    );
    const el = screen.getByText('Go').closest('a')!;
    expect(el).not.toHaveAttribute('href');
    await userEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });
});
