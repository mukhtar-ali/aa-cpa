import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PillarCard } from './PillarCard';

const pillar = { icon: 'scan', title: 'Technology that shortens the work, not the judgement.', body: 'Our analytics find deviations faster than manual sampling.' };

describe('PillarCard', () => {
  it('is an article with an H3 title (H4 size) and Body/Large text', () => {
    render(<PillarCard pillar={pillar} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: pillar.title })).toHaveClass('text-h4', 'font-bold');
    expect(screen.getByText(pillar.body)).toHaveClass('text-body-lg');
  });

  it('shows the 48 px decorative icon', () => {
    const { container } = render(<PillarCard pillar={pillar} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '48');
  });

  it('dark tone has the inverse border and 20 px radius; light tone is a bordered white card', () => {
    const { rerender } = render(<PillarCard pillar={pillar} />);
    expect(screen.getByRole('article')).toHaveClass('rounded-card', 'border-border-inverse', 'text-text-inverse');
    rerender(<PillarCard pillar={pillar} tone="light" />);
    expect(screen.getByRole('article')).toHaveClass('border-border-subtle', 'bg-bg-surface');
  });

  it('wide puts the icon beside the text from sm', () => {
    render(<PillarCard pillar={pillar} size="wide" />);
    expect(screen.getByRole('article')).toHaveClass('sm:flex-row');
  });

  it.each(['ar', 'en'])('has no axe violations in %s (dark and light)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-bg-inverse">
          <PillarCard pillar={pillar} />
        </div>
        <PillarCard pillar={{ ...pillar, icon: 'hexagon-dot' }} tone="light" size="wide" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
