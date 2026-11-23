import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { FormSuccess } from './FormSuccess';

describe('FormSuccess', () => {
  it('renders the title as the page heading, the body and a link action', () => {
    render(<FormSuccess title="Sent" body="Thank you." action={{ label: 'Back to home', href: '/ar' }} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Sent' })).toBeInTheDocument();
    expect(screen.getByText('Thank you.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/ar');
  });

  it('is announced as status and omits optional parts', () => {
    render(<FormSuccess title="Sent" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders children (for a client retry button) and allows a lower heading level', () => {
    render(
      <FormSuccess title="Sent" level={2}>
        <button type="button">Retry</button>
      </FormSuccess>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <FormSuccess title="Sent" body="Thank you." action={{ label: 'Back to home', href: '/' }} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
