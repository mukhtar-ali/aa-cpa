import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { FaqAccordion } from './FaqAccordion';

const items = [
  { id: 'q1', question: 'How long does an external audit take?', answer: 'About four weeks from receiving the complete file.' },
  { id: 'q2', question: 'Who signs the audit report?', answer: 'A licensed partner signs every report.' },
  { id: 'q3', question: 'Can you work with our bank?', answer: 'Yes, we deliver reports in the format banks ask for.' },
];

describe('FaqAccordion', () => {
  it('renders an H3 trigger per question with aria-expanded and all answers collapsed by default', () => {
    render(<FaqAccordion title="FAQ" items={items} />);
    expect(screen.getByRole('heading', { level: 2, name: 'FAQ' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    const trigger = screen.getByRole('button', { name: items[0]!.question });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(items[0]!.answer)).toBeNull();
  });

  it('Enter and Space toggle an item', async () => {
    render(<FaqAccordion items={items} />);
    const trigger = screen.getByRole('button', { name: items[1]!.question });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(items[1]!.answer)).toBeInTheDocument();
    await userEvent.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(items[1]!.answer)).toBeNull();
  });

  it('opening one item closes the previous one', async () => {
    render(<FaqAccordion items={items} />);
    await userEvent.click(screen.getByRole('button', { name: items[0]!.question }));
    await userEvent.click(screen.getByRole('button', { name: items[2]!.question }));
    expect(screen.getByRole('button', { name: items[0]!.question })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: items[2]!.question })).toHaveAttribute('aria-expanded', 'true');
  });

  it('arrow keys move focus between the question buttons', async () => {
    render(<FaqAccordion items={items} />);
    screen.getByRole('button', { name: items[0]!.question }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: items[1]!.question })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', { name: items[0]!.question })).toHaveFocus();
  });

  it('can start with an item open and shows a plus icon that turns into a minus', async () => {
    const { container } = render(<FaqAccordion items={items} defaultOpenId="q1" />);
    expect(screen.getByText(items[0]!.answer)).toBeInTheDocument();
    const bars = container.querySelectorAll('button span[aria-hidden="true"] span');
    expect(bars).toHaveLength(items.length * 2);
    expect(bars[1]).toHaveClass('group-data-[state=open]:opacity-0');
  });

  it('questions use the H4 size and the answer Body/Large with a 1 px divider', () => {
    render(<FaqAccordion items={items} defaultOpenId="q1" />);
    expect(screen.getByText(items[0]!.question)).toHaveClass('text-h4', 'font-bold');
    expect(screen.getByText(items[0]!.answer)).toHaveClass('text-body-lg');
    expect(screen.getAllByRole('button')[0]!.closest('h3')!.parentElement).toHaveClass('border-b', 'border-border-subtle');
  });

  it.each(['ar', 'en'])('has no axe violations in %s (collapsed and open)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <FaqAccordion title="FAQ" items={items} defaultOpenId="q2" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
