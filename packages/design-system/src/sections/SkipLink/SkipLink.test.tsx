import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('is a link to #main by default, hidden until focused', () => {
    render(<SkipLink label="Skip to content" />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toHaveAttribute('href', '#main');
    expect(link).toHaveClass('sr-only', 'focus:not-sr-only');
  });

  it('accepts another target', () => {
    render(<SkipLink label="Skip" href="#content" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '#content');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang}>
        <SkipLink label={lang === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content'} />
        <main id="main">x</main>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
