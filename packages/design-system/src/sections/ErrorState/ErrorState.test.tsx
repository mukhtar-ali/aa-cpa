import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders the title as the page heading, the body and a link action', () => {
    render(<ErrorState title="Something went wrong" body="We could not load this page." action={{ label: 'Back to home', href: '/ar' }} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByText('We could not load this page.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/ar');
  });

  it('is announced as alert and omits optional parts', () => {
    render(<ErrorState title="Something went wrong" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders children (for a client retry button) and allows a lower heading level', () => {
    render(
      <ErrorState title="Something went wrong" level={2}>
        <button type="button">Retry</button>
      </ErrorState>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ErrorState title="Something went wrong" body="We could not load this page." action={{ label: 'Back to home', href: '/' }} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
