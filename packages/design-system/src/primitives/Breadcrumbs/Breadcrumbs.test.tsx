import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Breadcrumbs } from './Breadcrumbs';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Articles', href: '/articles' },
  { label: 'How AI changes auditing', href: '/articles/ai' },
];

describe('Breadcrumbs', () => {
  it('is a labelled navigation landmark with an ordered list', () => {
    render(<Breadcrumbs items={items} label="Breadcrumb" />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByRole('list').tagName).toBe('OL');
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
  });

  it('links every item except the last, which is the current page', () => {
    render(<Breadcrumbs items={items} label="Breadcrumb" />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Articles' })).toHaveAttribute('href', '/articles');
    expect(screen.queryByRole('link', { name: 'How AI changes auditing' })).toBeNull();
    expect(screen.getByText('How AI changes auditing')).toHaveAttribute('aria-current', 'page');
  });

  it('separators are decorative chevrons that mirror in RTL; none after the last item', () => {
    const { container } = render(<Breadcrumbs items={items} label="Breadcrumb" />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(2);
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveClass('rtl:-scale-x-100');
    });
  });

  it('dark tone uses inverse text colours', () => {
    render(<Breadcrumbs items={items} label="Breadcrumb" tone="dark" />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass('text-text-inverse-muted');
    expect(screen.getByText('How AI changes auditing')).toHaveClass('text-text-inverse');
  });

  it('renders nothing for an empty trail', () => {
    const { container } = render(<Breadcrumbs items={[]} label="Breadcrumb" />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(['ar', 'en'])('has no axe violations in %s (light and dark)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Breadcrumbs items={items} label="Breadcrumb" />
        <div className="bg-bg-hero">
          <Breadcrumbs items={items} label="Breadcrumb (dark)" tone="dark" />
        </div>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
