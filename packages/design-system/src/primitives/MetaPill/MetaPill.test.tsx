import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { MetaPill } from './MetaPill';

describe('MetaPill', () => {
  it('renders the label, a decorative 18 px icon and pill styling', () => {
    const { container } = render(<MetaPill icon="location">Riyadh</MetaPill>);
    const pill = screen.getByText('Riyadh').parentElement!;
    expect(pill).toHaveClass('h-10', 'rounded-full', 'border-border-subtle', 'bg-bg-surface', 'text-body-sm');
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '18');
  });

  it.each(['location', 'contract', 'experience', 'date'] as const)('icon %s renders', (icon) => {
    const { container } = render(<MetaPill icon={icon}>x</MetaPill>);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <MetaPill icon="date">{lang === 'ar' ? '12 أكتوبر 2026' : '12 Oct 2026'}</MetaPill>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
