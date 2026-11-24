import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { StateMessage } from './StateMessage';

describe('StateMessage', () => {
  it('renders the title as the page heading with body, eyebrow and a link action', () => {
    render(<StateMessage title="Page not found" eyebrow="404" body="The link may be wrong." action={{ label: 'Back to home', href: '/ar' }} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('The link may be wrong.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/ar');
  });

  it('omits the optional parts and honours level, role and children', () => {
    render(
      <StateMessage title="Saved" level={2} role="status">
        <button type="button">Retry</button>
      </StateMessage>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Saved' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <StateMessage title="Nothing here yet" body="Check back later." action={{ label: 'Home', href: '/' }} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
