import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PerkTile } from './PerkTile';

const perk = { title: 'Competitive salary', body: 'Plus an annual performance bonus' };

describe('PerkTile', () => {
  it('is an ice tile with 18 px radius, an H3 title (Body/Medium Bold) and text', () => {
    render(<PerkTile perk={perk} />);
    expect(screen.getByRole('article')).toHaveClass('bg-bg-surface-ice', 'rounded-perk', 'min-h-22');
    expect(screen.getByRole('heading', { level: 3, name: perk.title })).toHaveClass('text-body-md', 'font-bold');
    expect(screen.getByText(perk.body)).toHaveClass('text-body-sm', 'text-text-body');
  });

  it('shows the optional decorative icon', () => {
    const { container } = render(<PerkTile perk={{ ...perk, icon: 'award' }} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    const { container: plain } = render(<PerkTile perk={perk} />);
    expect(plain.querySelector('svg')).toBeNull();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <PerkTile perk={{ ...perk, icon: 'award' }} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
