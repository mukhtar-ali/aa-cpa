import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ArticleBody } from './ArticleBody';

const content = (
  <>
    <p>Annual review starts weeks before the auditor arrives.</p>
    <h2 id="s1">1. Organise your accounting records</h2>
    <p>Make sure monthly accounts are closed and bank reconciliations are done.</p>
    <blockquote>
      Every document ready before we start saves your team a day.
      <cite>Licensed partner</cite>
    </blockquote>
    <ul>
      <li>Bank statements for the whole financial year</li>
      <li>Customer and supplier contracts</li>
    </ul>
    <figure>
      <img src="/p.jpg" alt="Preparatory meeting" />
      <figcaption>Preparatory meeting with the audit team</figcaption>
    </figure>
  </>
);

describe('ArticleBody', () => {
  it('wraps the content in the .ds-prose container inside an article', () => {
    const { container } = render(<ArticleBody>{content}</ArticleBody>);
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(container.querySelector('.ds-prose')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: '1. Organise your accounting records' })).toHaveAttribute('id', 's1');
  });

  it('keeps the semantic structure for lists, quotes with citation and figures with captions', () => {
    render(<ArticleBody>{content}</ArticleBody>);
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Licensed partner').tagName).toBe('CITE');
    expect(screen.getByRole('figure')).toContainElement(screen.getByText('Preparatory meeting with the audit team'));
  });

  it('renders tags as a labelled list of chips and omits it without tags', () => {
    const { rerender } = render(
      <ArticleBody tags={['Audit', 'Financial statements', 'Compliance']} tagsLabel="Tags">
        {content}
      </ArticleBody>,
    );
    const list = screen.getByRole('list', { name: 'Tags' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(within(list).getByText('Audit')).toHaveClass('h-10', 'rounded-full');
    rerender(<ArticleBody>{content}</ArticleBody>);
    expect(screen.queryByRole('list', { name: 'Tags' })).toBeNull();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ArticleBody tags={['Audit']} tagsLabel="Tags">
          {content}
        </ArticleBody>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
