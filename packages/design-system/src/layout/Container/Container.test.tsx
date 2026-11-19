import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Container } from './Container';

describe('Container component', () => {
  it('renders children within a default container', () => {
    const { getByText } = render(
      <Container>
        <p>Container Content</p>
      </Container>,
    );

    expect(getByText('Container Content')).toBeInTheDocument();
  });

  it('renders as a custom polymorphic element using "as"', () => {
    const { container } = render(
      <Container as="section">
        <p>Section Content</p>
      </Container>,
    );

    const sectionEl = container.querySelector('section');
    expect(sectionEl).toBeInTheDocument();
    expect(sectionEl?.tagName.toLowerCase()).toBe('section');
  });

  it('applies default size classes with responsive gutters (16/24/32 px)', () => {
    const { container } = render(
      <Container>
        <span>Content</span>
      </Container>,
    );

    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveClass('w-full');
    expect(el).toHaveClass('px-4');
    expect(el).toHaveClass('sm:px-6');
    expect(el).toHaveClass('lg:px-8');
    expect(el).toHaveClass('max-w-(--container-max-width)');
  });

  it('supports "size" variants (default, wide, full)', () => {
    const { container: defaultContainer } = render(
      <Container size="default">Default</Container>,
    );
    expect(defaultContainer.firstElementChild).toHaveClass(
      'max-w-(--container-max-width)',
    );

    const { container: wideContainer } = render(
      <Container size="wide">Wide</Container>,
    );
    expect(wideContainer.firstElementChild).toHaveClass(
      'max-w-(--container-wide-max-width)',
    );

    const { container: fullContainer } = render(
      <Container size="full">Full</Container>,
    );
    expect(fullContainer.firstElementChild).toHaveClass('max-w-full');
  });

  it('merges custom className with cn()', () => {
    const { container } = render(
      <Container className="custom-container-class">Content</Container>,
    );

    expect(container.firstElementChild).toHaveClass('custom-container-class');
  });

  it('forwards ref to the underlying DOM element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Container ref={ref}>Ref test</Container>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders correctly under RTL and LTR directions', () => {
    const { container: rtlContainer } = render(
      <div dir="rtl">
        <Container>محتوى الحاوية</Container>
      </div>,
    );
    expect(rtlContainer.querySelector('div[dir="rtl"]')).toBeInTheDocument();

    const { container: ltrContainer } = render(
      <div dir="ltr">
        <Container>LTR Content</Container>
      </div>,
    );
    expect(ltrContainer.querySelector('div[dir="ltr"]')).toBeInTheDocument();
  });

  it('passes automated axe accessibility check with no violations', async () => {
    const { container } = render(
      <main>
        <Container>
          <h1>Page Title</h1>
          <p>Main content area inside container.</p>
        </Container>
      </main>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
