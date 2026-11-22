import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SectionHeading } from './SectionHeading';

describe('SectionHeading', () => {
  it('renders the H2 title in the heading colour and the gradient eyebrow above it', () => {
    render(<SectionHeading eyebrow="Why us" title="Why do companies move to us?" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Why do companies move to us?' })).toHaveClass('text-h2', 'font-bold', 'text-text-heading');
    expect(screen.getByText('Why us')).toHaveClass('text-body-lg', 'font-bold', 'text-transparent', 'bg-clip-text', 'to-gradient-end-text-large');
  });

  it('supports an accent line, description, action and a different level', () => {
    render(<SectionHeading level={3} title="Title" accent="Accent line" description="Describing text." action={{ label: 'More', href: '/more' }} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title');
    expect(screen.getByText('Accent line')).toHaveClass('text-transparent');
    expect(screen.getByText('Describing text.')).toHaveClass('text-body-lg', 'text-text-body');
    expect(screen.getByRole('link', { name: 'More' })).toHaveAttribute('href', '/more');
  });

  it('omits optional parts when absent', () => {
    const { container } = render(<SectionHeading title="Only title" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('dark tone uses inverse colours and the paper button', () => {
    render(<SectionHeading tone="dark" title="Dark" description="Text" action={{ label: 'Go', href: '/' }} />);
    expect(screen.getByRole('heading')).toHaveClass('text-text-inverse');
    expect(screen.getByText('Text')).toHaveClass('text-text-inverse-muted');
    expect(screen.getByRole('link', { name: 'Go' })).toHaveClass('bg-bg-page', 'text-text-strong');
  });

  it('split places title and description side by side from lg', () => {
    const { container } = render(<SectionHeading split title="T" description="D" />);
    expect(container.firstElementChild).toHaveClass('lg:flex-row', 'lg:justify-between');
  });

  it.each(['ar', 'en'])('has no axe violations in %s (light and dark)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <SectionHeading eyebrow="Eyebrow" title="Title" accent="Accent" description="Description" action={{ label: 'Action', href: '/' }} />
        <div className="bg-bg-inverse">
          <SectionHeading tone="dark" eyebrow="Eyebrow" title="Title" description="Description" action={{ label: 'Action', href: '/' }} />
        </div>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
