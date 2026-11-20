import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { FormErrorSummary } from './FormErrorSummary';

const errors = [
  { id: 'name', message: 'Enter your name' },
  { id: 'email', message: 'Enter a valid email' },
];

describe('FormErrorSummary', () => {
  it('renders nothing without errors', () => {
    const { container } = render(<FormErrorSummary title="Fix these" errors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('is an alert with the title and one link per error', () => {
    render(<FormErrorSummary title="Fix these" errors={errors} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Fix these');
    expect(screen.getByRole('link', { name: 'Enter your name' })).toHaveAttribute('href', '#name');
    expect(screen.getByRole('link', { name: 'Enter a valid email' })).toHaveAttribute('href', '#email');
  });

  it('takes focus on mount', () => {
    render(<FormErrorSummary title="Fix these" errors={errors} />);
    expect(screen.getByRole('alert')).toHaveFocus();
  });

  it('takes focus when errors appear after being empty', () => {
    const { rerender } = render(<FormErrorSummary title="Fix these" errors={[]} />);
    rerender(<FormErrorSummary title="Fix these" errors={errors} />);
    expect(screen.getByRole('alert')).toHaveFocus();
  });

  it('clicking a message focuses its field', async () => {
    render(
      <>
        <FormErrorSummary title="Fix these" errors={errors} />
        <input id="name" aria-label="Name" />
        <input id="email" aria-label="Email" />
      </>,
    );
    await userEvent.click(screen.getByRole('link', { name: 'Enter a valid email' }));
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <FormErrorSummary title={lang === 'ar' ? 'يرجى تصحيح الأخطاء' : 'Fix these'} errors={errors} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
