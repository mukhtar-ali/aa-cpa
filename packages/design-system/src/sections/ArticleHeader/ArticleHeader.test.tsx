import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ArticleHeader } from './ArticleHeader';

const props = {
  breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'News', href: '/news' }, { label: 'Audit', href: '/news/audit' }],
  breadcrumbsLabel: 'Breadcrumb',
  category: 'Audit',
  title: 'What should your company prepare before the annual audit?',
  author: { name: 'Al-Shabibshiri team' },
  meta: '12 October 2026 · 6 min read',
  dateISO: '2026-10-12',
  cover: { src: '/c.jpg', alt: 'Audit meeting', width: 1140, height: 480 },
};

describe('ArticleHeader', () => {
  it('has breadcrumbs, the category chip, the page H1 and the cover image', () => {
    const { container } = render(<ArticleHeader {...props} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(container.querySelector('header > span.h-10')).toHaveTextContent('Audit');
    expect(container.querySelector('header > span.h-10')).toHaveClass('rounded-full');
    expect(screen.getByRole('heading', { level: 1, name: props.title })).toHaveClass('text-h1');
    expect(screen.getByRole('img', { name: 'Audit meeting' })).toHaveClass('aspect-[1140/480]', 'object-cover');
  });

  it('shows the author with a 52 px avatar and the date line as a time element', () => {
    render(<ArticleHeader {...props} />);
    expect(screen.getByText('Al-Shabibshiri team')).toHaveClass('font-bold', 'text-body-md');
    expect(screen.getByText(props.meta).tagName).toBe('TIME');
    expect(screen.getByText(props.meta)).toHaveAttribute('datetime', '2026-10-12');
    // The avatar is decorative: the name is already written next to it.
    expect(screen.queryByRole('img', { name: 'Al-Shabibshiri team' })).toBeNull();
    expect(screen.getByText('Al-Shabibshiri team').closest('div')?.parentElement?.querySelector('.size-13')).not.toBeNull();
  });

  it('renders the share slot at the end of the author row', () => {
    render(<ArticleHeader {...props} share={<button type="button">Share</button>} />);
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
  });

  it('omits breadcrumbs, cover and date semantics when not provided', () => {
    const { container } = render(<ArticleHeader {...props} breadcrumbs={undefined} cover={undefined} dateISO={undefined} />);
    expect(container.querySelector('nav')).toBeNull();
    expect(container.querySelector('time')).toBeNull();
    expect(screen.getByText(props.meta).tagName).toBe('P');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ArticleHeader {...props} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
