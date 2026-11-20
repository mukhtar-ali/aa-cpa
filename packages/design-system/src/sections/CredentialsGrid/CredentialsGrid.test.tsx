import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { CredentialsGrid } from './CredentialsGrid';

const logos = [
  { name: 'SOCPA', image: { src: '/socpa.svg', alt: 'SOCPA', width: 124, height: 80 } },
  { name: '3E Accounting', image: { src: '/3e.png', alt: '3E Accounting', width: 153, height: 23 } },
  { name: 'Placeholder 3', placeholder: true },
  { name: 'Placeholder 4', placeholder: true },
];

describe('CredentialsGrid', () => {
  it('has an H2 title, an intro line and a list of logos named once', () => {
    render(<CredentialsGrid title="Accredited by" description="We work under official licences." logos={logos} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Accredited by' })).toHaveClass('text-h4');
    expect(screen.getByText('We work under official licences.')).toBeInTheDocument();
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'SOCPA' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '3E Accounting' })).toBeInTheDocument();
  });

  it('hides placeholder cells unless showPlaceholders is set', () => {
    const { rerender } = render(<CredentialsGrid title="T" logos={logos} placeholderLabel="Organisation logo" />);
    expect(screen.queryByText('Organisation logo')).toBeNull();
    rerender(<CredentialsGrid title="T" logos={logos} showPlaceholders placeholderLabel="Organisation logo" />);
    const cells = screen.getAllByText('Organisation logo');
    expect(cells).toHaveLength(2);
    expect(cells[0]!.parentElement).toHaveClass('border-dashed', 'border-border-subtle');
  });

  it('real logo cells are white, 4 px radius, decor border and 120 px high', () => {
    render(<CredentialsGrid title="T" logos={logos} />);
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('bg-bg-surface', 'rounded-sm', 'border-border-decor', 'h-30');
  });

  it('is the dark band', () => {
    const { container } = render(<CredentialsGrid title="T" logos={logos} />);
    expect(container.firstElementChild).toHaveClass('bg-bg-inverse', 'text-text-on-action');
  });

  it.each(['ar', 'en'])('has no axe violations in %s (with placeholders)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <CredentialsGrid title="Accredited by" description="Intro" logos={logos} showPlaceholders placeholderLabel="Logo" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
