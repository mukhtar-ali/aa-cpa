import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Testimonial } from './Testimonial';

const data = {
  quote: 'A partner who knows our name and signs on time.',
  rating: 5 as const,
  name: 'Omar Al-Salem',
  role: 'Chief Financial Officer',
  company: 'Sample Contracting Co.',
};

describe('Testimonial', () => {
  it('is a figure with the quote and a caption naming the person and role', () => {
    render(<Testimonial testimonial={data} ratingLabel="5 of 5" />);
    expect(screen.getByRole('figure')).toBeInTheDocument();
    expect(screen.getByText(data.quote).tagName).toBe('BLOCKQUOTE');
    expect(screen.getByText('Omar Al-Salem')).toHaveClass('font-bold');
    expect(screen.getByText('Chief Financial Officer · Sample Contracting Co.')).toBeInTheDocument();
  });

  it('shows the rating image only when a rating and its label are given', () => {
    const { rerender } = render(<Testimonial testimonial={data} ratingLabel="5 of 5" />);
    expect(screen.getByRole('img', { name: '5 of 5' })).toBeInTheDocument();
    rerender(<Testimonial testimonial={{ ...data, rating: undefined }} />);
    expect(screen.queryByRole('img', { name: '5 of 5' })).toBeNull();
  });

  it('falls back to initials without an avatar and omits the company separator when there is no company', () => {
    render(<Testimonial testimonial={{ ...data, company: undefined }} />);
    expect(screen.queryByRole('img', { name: 'Omar Al-Salem' })).toBeNull();
    expect(screen.getAllByText('Omar Al-Salem')).toHaveLength(1);
    expect(screen.getByText('OA')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Chief Financial Officer')).toBeInTheDocument();
  });

  it('dark tone uses inverse colours, light tone the heading colours', () => {
    const { rerender } = render(<Testimonial testimonial={data} />);
    expect(screen.getByText(data.quote)).toHaveClass('text-text-inverse');
    rerender(<Testimonial testimonial={data} tone="light" />);
    expect(screen.getByText(data.quote)).toHaveClass('text-text-heading');
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s (dark and light)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-bg-inverse">
          <Testimonial testimonial={data} ratingLabel="5 of 5" />
        </div>
        <Testimonial testimonial={data} ratingLabel="5 of 5" tone="light" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
