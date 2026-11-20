import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PageHero } from './PageHero';

const image = { src: '/hero.jpg', alt: '', width: 1512, height: 420, decorative: true };

describe('PageHero', () => {
  it('renders the title as the page h1 with the supporting sentence under it', () => {
    render(<PageHero title="Licensed, local, accountable" subtitle="The firm Saudi companies turn to." image={image} />);
    const h1 = screen.getByRole('heading', { level: 1, name: 'Licensed, local, accountable' });
    expect(h1).toHaveClass('text-h1', 'text-text-inverse');
    expect(screen.getByText('The firm Saudi companies turn to.')).toHaveClass('text-body-lg', 'text-text-inverse');
  });

  it('uses the photo as a decorative background under an 81 % dark overlay', () => {
    const { container } = render(<PageHero title="T" image={image} />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('alt', '');
    expect(img.parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(img).toHaveClass('object-cover');
    expect(container.querySelector('[data-overlay]')).toHaveClass('bg-bg-hero/81');
  });

  it('matches the Figma spacing: 200 px above, 96 px below, 24 px between lines', () => {
    const { container } = render(<PageHero title="T" subtitle="S" image={image} />);
    const inner = container.querySelector('section > div:last-child')!;
    expect(inner).toHaveClass('pt-50', 'pb-24', 'gap-6');
  });

  it('omits optional parts when absent', () => {
    const { container } = render(<PageHero title="T" image={image} />);
    expect(container.querySelector('nav')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('renders breadcrumbs (dark) and one action', () => {
    render(
      <PageHero
        title="T"
        image={image}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }]}
        breadcrumbsLabel="Breadcrumb"
        action={{ label: 'Request a quote', href: '/quote' }}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a quote' })).toHaveAttribute('href', '/quote');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <PageHero
          title={lang === 'ar' ? 'مرخّصون، محليّون، ومسؤولون بالاسم' : 'Licensed, local, accountable'}
          subtitle={lang === 'ar' ? 'الشركة التي تلجأ إليها المنشآت السعودية.' : 'The firm Saudi companies turn to.'}
          image={image}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }]}
          breadcrumbsLabel="Breadcrumb"
          action={{ label: 'Contact', href: '/contact' }}
        />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
