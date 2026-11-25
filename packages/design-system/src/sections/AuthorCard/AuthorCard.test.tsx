import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { AuthorCard } from './AuthorCard';

const author = { name: 'Al-Shabibshiri team', role: 'Licensed partners', bio: 'We write plainly about audit, tax and zakat.', avatar: { src: '/a.jpg', alt: 'Team', width: 56, height: 56 } };

describe('AuthorCard', () => {
  it('is a complementary card with avatar, bold name, muted role and bio', () => {
    render(<AuthorCard author={author} />);
    expect(screen.getByRole('complementary')).toHaveClass('rounded-cta', 'border-border-subtle', 'bg-bg-surface');
    // The avatar sits next to the visible name, so it is decorative (empty alt) and the name is not read twice.
    expect(screen.queryByRole('img')).toBeNull();
    expect(document.querySelector('img')).toHaveAttribute('alt', '');
    expect(screen.getByText('Al-Shabibshiri team')).toHaveClass('font-bold', 'text-body-md');
    expect(screen.getByText('Licensed partners')).toHaveClass('text-text-muted', 'text-body-sm');
    expect(screen.getByText(author.bio)).toHaveClass('text-text-body');
  });

  it('falls back to initials and omits role and bio when absent', () => {
    render(<AuthorCard author={{ name: 'Sara Ali' }} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('SA')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByText('Licensed partners')).toBeNull();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <AuthorCard author={author} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
