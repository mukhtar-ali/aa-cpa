import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title as the page heading, the body and a link action', () => {
    render(<EmptyState title="Nothing here yet" body="Check back later." action={{ label: 'View all services', href: '/ar' }} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Nothing here yet' })).toBeInTheDocument();
    expect(screen.getByText('Check back later.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all services' })).toHaveAttribute('href', '/ar');
  });

  it('is announced as status and omits optional parts', () => {
    render(<EmptyState title="Nothing here yet" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders children (for a client retry button) and allows a lower heading level', () => {
    render(
      <EmptyState title="Nothing here yet" level={2}>
        <button type="button">Retry</button>
      </EmptyState>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <EmptyState title="Nothing here yet" body="Check back later." action={{ label: 'View all services', href: '/' }} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
