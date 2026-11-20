import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Section } from './Section';

describe('Section component', () => {
  it('renders children within a semantic <section> by default', () => {
    const { getByText, container } = render(
      <Section>
        <p>Section Body</p>
      </Section>,
    );

    expect(getByText('Section Body')).toBeInTheDocument();
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('section');
  });

  it('supports custom polymorphic element using "as"', () => {
    const { container } = render(
      <Section as="div">
        <p>Div Section</p>
      </Section>,
    );

    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('div');
  });

  it('applies tone variants (page, ice, surface, inverse, hero)', () => {
    const tones = ['page', 'ice', 'surface', 'inverse', 'hero'] as const;

    for (const tone of tones) {
      const { container } = render(
        <Section tone={tone}>
          <span>{tone}</span>
        </Section>,
      );

      expect(container.firstElementChild).toHaveClass(tone === 'ice' ? 'bg-bg-surface-ice' : `bg-bg-${tone}`);
    }
  });

  it('applies rounded variants using section radius token (30px) (none, top, bottom, both)', () => {
    const { container: noneContainer } = render(
      <Section rounded="none">None</Section>,
    );
    expect(noneContainer.firstElementChild).toHaveClass('rounded-none');

    const { container: topContainer } = render(
      <Section rounded="top">Top</Section>,
    );
    expect(topContainer.firstElementChild).toHaveClass('rounded-t-section');

    const { container: bottomContainer } = render(
      <Section rounded="bottom">Bottom</Section>,
    );
    expect(bottomContainer.firstElementChild).toHaveClass(
      'rounded-b-section',
    );

    const { container: bothContainer } = render(
      <Section rounded="both">Both</Section>,
    );
    expect(bothContainer.firstElementChild).toHaveClass('rounded-section');
  });

  it('applies spacing variants (none, sm, md, lg, xl)', () => {
    const { container: smContainer } = render(
      <Section spacing="sm">Small</Section>,
    );
    expect(smContainer.firstElementChild).toHaveClass('py-section-sm');

    const { container: mdContainer } = render(
      <Section spacing="md">Medium</Section>,
    );
    expect(mdContainer.firstElementChild).toHaveClass('py-section-md');

    const { container: lgContainer } = render(
      <Section spacing="lg">Large</Section>,
    );
    expect(lgContainer.firstElementChild).toHaveClass('py-section-lg');

    const { container: xlContainer } = render(
      <Section spacing="xl">Extra Large</Section>,
    );
    expect(xlContainer.firstElementChild).toHaveClass('py-section-xl');

    const { container: noneContainer } = render(
      <Section spacing="none">None</Section>,
    );
    expect(noneContainer.firstElementChild).toHaveClass('py-0');
  });

  it('renders optional pattern component marked aria-hidden with tone derived from section tone', () => {
    const { container: darkSec } = render(
      <Section tone="inverse" pattern="flow-lines">
        <p>Content</p>
      </Section>,
    );

    const patternEl = darkSec.querySelector('[aria-hidden="true"]');
    expect(patternEl).toBeInTheDocument();
    expect(patternEl).toHaveClass('text-border-inverse');
    expect(darkSec.firstElementChild).toHaveClass('relative');
    expect(darkSec.firstElementChild).toHaveClass('overflow-hidden');

    // Light tone section derives light pattern tone (logo-lines -> text-border-decor)
    const { container: lightSec } = render(
      <Section tone="page" pattern="logo-lines">
        <p>Content</p>
      </Section>,
    );
    const lightPatternEl = lightSec.querySelector('[aria-hidden="true"]');
    expect(lightPatternEl).toBeInTheDocument();
    expect(lightPatternEl).toHaveClass('text-border-decor');

    // Hero tone section derives dark pattern tone (logo-lines -> text-border-inverse)
    const { container: heroSec } = render(
      <Section tone="hero" pattern="logo-lines">
        <p>Content</p>
      </Section>,
    );
    const heroPatternEl = heroSec.querySelector('[aria-hidden="true"]');
    expect(heroPatternEl).toBeInTheDocument();
    expect(heroPatternEl).toHaveClass('text-border-inverse');
  });

  it('does not render pattern container when pattern prop is absent', () => {
    const { container } = render(<Section>No Pattern</Section>);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('passes through aria-labelledby attribute', () => {
    const { container } = render(
      <Section aria-labelledby="section-heading-id">
        <h2 id="section-heading-id">Section Title</h2>
      </Section>,
    );

    expect(container.firstElementChild).toHaveAttribute(
      'aria-labelledby',
      'section-heading-id',
    );
  });

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Section ref={ref}>Ref Content</Section>);

    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('renders correctly under RTL and LTR contexts', () => {
    const { container: rtl } = render(
      <div dir="rtl">
        <Section tone="ice">
          <h2>عنوان القسم</h2>
        </Section>
      </div>,
    );
    expect(rtl.querySelector('div[dir="rtl"]')).toBeInTheDocument();

    const { container: ltr } = render(
      <div dir="ltr">
        <Section tone="ice">
          <h2>Section Title</h2>
        </Section>
      </div>,
    );
    expect(ltr.querySelector('div[dir="ltr"]')).toBeInTheDocument();
  });

  it('passes automated axe accessibility check with no violations', async () => {
    const { container } = render(
      <Section aria-labelledby="heading-sec-1" tone="page">
        <h2 id="heading-sec-1">Accessible Section Title</h2>
        <p>Section textual content meets contrast and landmark criteria.</p>
      </Section>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
