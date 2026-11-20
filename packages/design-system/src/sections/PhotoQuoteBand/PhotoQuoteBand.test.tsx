import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PhotoQuoteBand } from './PhotoQuoteBand';

const props = {
  title: 'One partner, from the first file\nto the signed report.',
  body: 'No middleman between you and the signer.',
  action: { label: 'Request a quote', href: '/quote' },
  image: { src: '/room.jpg', alt: 'Conference table', width: 720, height: 640 },
};

describe('PhotoQuoteBand', () => {
  it('is the inverse band with an H2 headline at the H1 size and Body/Large text', () => {
    const { container } = render(<PhotoQuoteBand {...props} />);
    expect(container.firstElementChild).toHaveClass('bg-bg-inverse', 'text-text-inverse');
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-h1', 'font-bold', 'whitespace-pre-line');
    expect(screen.getByText(props.body)).toHaveClass('text-body-lg');
  });

  it('keeps line breaks of the headline', () => {
    render(<PhotoQuoteBand {...props} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('\n');
  });

  it('shows the photo at 720:640 and the paper button', () => {
    render(<PhotoQuoteBand {...props} />);
    expect(screen.getByRole('img', { name: 'Conference table' })).toHaveClass('aspect-[720/640]', 'object-cover');
    expect(screen.getByRole('link', { name: 'Request a quote' })).toHaveClass('bg-bg-page', 'text-text-strong');
  });

  it('puts the text before the photo so the photo sits at the inline end, and the pattern is decorative', () => {
    const { container } = render(<PhotoQuoteBand {...props} />);
    const section = container.firstElementChild!;
    expect(section.firstElementChild).toContainElement(screen.getByRole('heading'));
    expect(section.lastElementChild?.tagName).toBe('IMG');
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('omits the action when none is given', () => {
    render(<PhotoQuoteBand {...props} action={undefined} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <PhotoQuoteBand {...props} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
