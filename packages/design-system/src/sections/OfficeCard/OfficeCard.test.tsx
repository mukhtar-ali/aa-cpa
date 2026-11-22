import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { MapLink, OfficeCard } from './OfficeCard';

const office = { city: 'Riyadh - head office', address: 'Al Sahafa district, Riyadh 13321', mapHref: 'https://maps.example.com/riyadh', mapLabel: 'Get directions' };

describe('OfficeCard', () => {
  it('is an article with the city as an H3 (H5 size), the address element and the gold directions link', () => {
    render(<OfficeCard office={office} />);
    expect(screen.getByRole('article')).toHaveClass('rounded-cta', 'border-border-subtle', 'bg-bg-surface', 'min-h-42.5');
    expect(screen.getByRole('heading', { level: 3, name: office.city })).toHaveClass('text-h5', 'font-bold');
    expect(screen.getByText(office.address).tagName).toBe('ADDRESS');
    const link = screen.getByRole('link', { name: /^Get directions/ });
    expect(link).toHaveAttribute('href', office.mapHref);
    expect(link).toHaveClass('text-text-accent', 'font-bold');
  });

  it('omits the link without map data', () => {
    render(<OfficeCard office={{ city: 'Qassim', address: 'Buraidah' }} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <OfficeCard office={office} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('MapLink', () => {
  it('is a link styled like the beige button with a decorative pin', () => {
    const { container } = render(<MapLink href="/map" label="View on map" />);
    const link = screen.getByRole('link', { name: 'View on map' });
    expect(link).toHaveClass('h-12', 'rounded-button', 'bg-bg-page', 'text-text-link', 'shadow-button-primary', 'hover:bg-action-primary');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('OfficeCard review fixes', () => {
  it('the directions link names its office so repeated links are distinguishable', () => {
    render(<OfficeCard office={office} />);
    expect(screen.getByRole('link', { name: 'Get directions: Riyadh - head office' })).toBeInTheDocument();
  });

  it('renders no directions link for a script URL', () => {
    render(<OfficeCard office={{ ...office, mapHref: 'javascript:alert(1)' }} />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});
