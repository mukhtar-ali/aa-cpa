import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { OfficeMap } from './OfficeMap';

const map = { src: '/map.svg', alt: '', width: 1140, height: 480, decorative: true };
const offices = [
  { city: 'Riyadh', address: 'a', mapHref: '/m/riyadh', coordinates: { x: 40, y: 55 }, isHeadquarters: true },
  { city: 'Khobar', address: 'b', mapHref: '/m/khobar', coordinates: { x: 70, y: 40 } },
  { city: 'Qassim', address: 'c' },
];

describe('OfficeMap', () => {
  it('the map image is decorative and the pins are a labelled list of links', () => {
    const { container } = render(<OfficeMap offices={offices} map={map} label="Our offices" />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('aria-hidden', 'true');
    const list = screen.getByRole('list', { name: 'Our offices' });
    expect(within(list).getAllByRole('link')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Riyadh' })).toHaveAttribute('href', '/m/riyadh');
  });

  it('positions pins from the inline start and the top by coordinates; offices without coordinates are not pinned', () => {
    render(<OfficeMap offices={offices} map={map} label="Our offices" />);
    const pin = screen.getByRole('link', { name: 'Khobar' }).closest('li') as HTMLElement;
    expect(pin.style.insetInlineStart).toBe('70%');
    expect(pin.style.top).toBe('40%');
    expect(screen.queryByRole('link', { name: 'Qassim' })).toBeNull();
  });

  it('marks the headquarters pin with the emerald icon', () => {
    render(<OfficeMap offices={offices} map={map} label="Our offices" />);
    expect(screen.getByRole('link', { name: 'Riyadh' }).querySelector('svg')).toHaveClass('text-emerald-600');
    expect(screen.getByRole('link', { name: 'Khobar' }).querySelector('svg')).toHaveClass('text-text-link');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <OfficeMap offices={offices} map={map} label="Our offices" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('OfficeMap review fixes', () => {
  it('two offices in one city render without duplicate keys, and a pin without a link is plain text', () => {
    render(
      <OfficeMap
        label="Our offices"
        map={{ src: '/map.svg', alt: '', width: 1140, height: 480, decorative: true }}
        offices={[
          { city: 'Riyadh', address: 'a', mapHref: '/m/1', coordinates: { x: 10, y: 10 } },
          { city: 'Riyadh', address: 'b', coordinates: { x: 20, y: 20 } },
        ]}
      />,
    );
    expect(screen.getAllByText('Riyadh')).toHaveLength(2);
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
