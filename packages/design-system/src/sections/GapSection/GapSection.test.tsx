import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { GapSection } from './GapSection';

const props = {
  statement: 'Mid-sized companies deserve what the big firms get: a partner who knows your name.',
  eyebrow: 'The gap we fill',
  body: 'Most companies reach a stage where the local accountant can no longer sign what the bank asks for.',
  images: [
    { src: '/a.jpg', alt: 'Tower', width: 220, height: 181 },
    { src: '/b.jpg', alt: 'Skyline', width: 315, height: 415 },
  ] as [{ src: string; alt: string; width: number; height: number }, { src: string; alt: string; width: number; height: number }],
};

describe('GapSection', () => {
  it('renders the statement as an h2 at the H3 size, the eyebrow and the paragraph', () => {
    render(<GapSection {...props} />);
    const h2 = screen.getByRole('heading', { level: 2, name: props.statement });
    expect(h2).toHaveClass('text-h3');
    expect(screen.getByText('The gap we fill')).toHaveClass('text-body-lg', 'font-bold');
    expect(screen.getByText(props.body)).toHaveClass('text-body-lg');
  });

  it('shows both photos: the small one with the 10 px thumb radius, the tall one 315:415', () => {
    render(<GapSection {...props} />);
    expect(screen.getByRole('img', { name: 'Tower' })).toHaveClass('rounded-thumb', 'aspect-[220/181]');
    expect(screen.getByRole('img', { name: 'Skyline' })).toHaveClass('aspect-[315/415]');
  });

  it('the tall photo comes first so the small one sits further along the inline end', () => {
    render(<GapSection {...props} />);
    const tall = screen.getByRole('img', { name: 'Skyline' });
    const small = screen.getByRole('img', { name: 'Tower' });
    expect(tall.compareDocumentPosition(small) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('is the page tone with decorative flow lines', () => {
    const { container } = render(<GapSection {...props} />);
    expect(container.firstElementChild).toHaveClass('bg-bg-page');
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <GapSection {...props} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
