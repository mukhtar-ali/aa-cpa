import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { LegalDocument } from './LegalDocument';

const doc = {
  updatedAt: '2026-09-01',
  summary: ['We collect only what we need.', 'You can ask us to delete your data.'],
  sections: [
    { id: 'collect', title: 'What we collect', html: '<p>Name, email and mobile number.</p>' },
    { id: 'use', title: 'How we use it', html: '<p>To answer your request.</p><ul><li>Reply</li></ul>' },
  ],
  downloadHref: '/files/privacy.pdf',
};
const labels = { tocTitle: 'On this page', tocLabel: 'Table of contents', updated: 'Last updated', summary: 'Summary', helpTitle: 'Have a question?', helpBody: 'Write to us and we will answer within two working days.', download: 'Download PDF' };

describe('LegalDocument', () => {
  it('has the table of contents, the numbered sections with ids and the section HTML', () => {
    render(<LegalDocument document={doc} labels={labels} locale="en" />);
    expect(screen.getByRole('navigation', { name: 'Table of contents' })).toBeInTheDocument();
    const h = screen.getByRole('heading', { level: 2, name: '1. What we collect' });
    expect(h).toHaveAttribute('id', 'collect');
    expect(screen.getByRole('heading', { level: 2, name: '2. How we use it' })).toBeInTheDocument();
    expect(screen.getByText('Name, email and mobile number.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'What we collect' })).toHaveAttribute('href', '#collect');
  });

  it('shows the updated pill with a machine-readable date and the ice summary box with dot bullets', () => {
    render(<LegalDocument document={doc} labels={labels} locale="en" />);
    expect(screen.getByText('September 1, 2026')).toHaveAttribute('datetime', '2026-09-01');
    expect(screen.getByText('Last updated:', { exact: false }).closest('p')).toHaveClass('bg-emerald-50', 'rounded-full', 'h-10');
    const box = screen.getByRole('heading', { level: 2, name: 'Summary' }).parentElement!;
    expect(box).toHaveClass('bg-bg-surface-ice', 'rounded-card');
    expect(within(box).getAllByRole('listitem')).toHaveLength(2);
  });

  it('the document card is white with the 30 px radius', () => {
    render(<LegalDocument document={doc} labels={labels} locale="en" />);
    expect(screen.getByRole('article')).toHaveClass('rounded-section', 'bg-bg-surface', 'border-border-subtle');
  });

  it('the dark help card has a download link only when a file exists', () => {
    const { rerender } = render(<LegalDocument document={doc} labels={labels} locale="en" />);
    const card = screen.getByRole('complementary');
    expect(card).toHaveClass('bg-bg-inverse');
    expect(within(card).getByRole('link', { name: 'Download PDF' })).toHaveAttribute('href', '/files/privacy.pdf');
    rerender(<LegalDocument document={{ ...doc, downloadHref: undefined }} labels={labels} locale="en" />);
    expect(screen.queryByRole('link', { name: 'Download PDF' })).toBeNull();
  });

  it('omits the summary box when there is no summary', () => {
    render(<LegalDocument document={{ ...doc, summary: [] }} labels={labels} locale="en" />);
    expect(screen.queryByRole('heading', { level: 2, name: 'Summary' })).toBeNull();
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <LegalDocument document={doc} labels={labels} locale={lang} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('LegalDocument review fixes', () => {
  it('renders no download link for a script URL', () => {
    render(<LegalDocument document={{ ...doc, downloadHref: 'javascript:alert(1)' }} labels={labels} locale="en" />);
    expect(screen.queryByRole('link', { name: 'Download PDF' })).toBeNull();
  });
});
