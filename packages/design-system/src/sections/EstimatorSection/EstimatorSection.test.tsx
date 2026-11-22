import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { EstimatorSection } from './EstimatorSection';

const estimator = {
  title: 'Get a number in 60 seconds',
  intro: 'Answer four questions for an indicative estimate.',
  locale: 'en' as const,
  config: {
    questions: [{ id: 'revenue', prompt: 'Annual revenue (SAR)', kind: 'currency' as const, min: 1 }],
    labels: { progress: 'Question {n} of {total}', next: 'Next', back: 'Back', start: 'Start estimate', result: 'Your range', disclaimer: 'Estimate only.', restart: 'Start over', invalid: 'Invalid', error: 'Error' },
    currency: 'SAR' as const,
    estimate: vi.fn().mockResolvedValue({ min: 1, max: 2 }),
  },
};
const props = {
  heading: 'Not ready to talk yet? Get a number in 60 seconds',
  intro: 'Answer four questions for an indicative estimate, with no commitment.',
  estimator,
  testimonial: { quote: 'A partner who knows our name.', rating: 5 as const, name: 'Omar Al-Salem', role: 'CFO', company: 'Sample Co.' },
  ratingLabel: '5 of 5',
};

describe('EstimatorSection', () => {
  it('has the H1-sized H2, the intro, the testimonial and the estimator card', () => {
    render(<EstimatorSection {...props} />);
    expect(screen.getByRole('heading', { level: 2, name: props.heading })).toHaveClass('text-h1', 'text-text-strong');
    expect(screen.getByText(props.intro)).toBeInTheDocument();
    expect(screen.getByRole('figure')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
  });

  it('is the page tone with decorative flow lines and a light testimonial', () => {
    const { container } = render(<EstimatorSection {...props} />);
    expect(container.firstElementChild).toHaveClass('bg-bg-page');
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText(props.testimonial.quote)).toHaveClass('text-text-heading');
  });

  it('puts the text first and the estimator card after it so the card sits at the inline end', () => {
    render(<EstimatorSection {...props} />);
    const heading = screen.getByRole('heading', { level: 2 });
    const card = screen.getByText('Question 1 of 1');
    expect(heading.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <EstimatorSection {...props} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
