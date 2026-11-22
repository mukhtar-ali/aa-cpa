import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Footer } from './Footer';

const props = {
  logo: <a href="/">Logo</a>,
  description: 'Partner-led audit, backed by AI precision.',
  socialsLabel: 'Social media',
  socials: [
    { network: 'linkedin' as const, href: 'https://linkedin.com/x', label: 'LinkedIn' },
    { network: 'x' as const, href: 'https://x.com/x', label: 'X' },
    { network: 'instagram' as const, href: 'https://instagram.com/x', label: 'Instagram' },
  ],
  columns: [
    { title: 'Quick links', links: [{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }] },
    { title: 'Services', links: [{ label: 'External audit', href: '/services/audit' }] },
    { title: 'Offices', links: [{ label: 'Riyadh', href: '/contact#riyadh' }, { label: 'Wiki', href: 'https://example.com', external: true }] },
  ],
  contacts: [
    { type: 'phone' as const, label: 'Phone', value: '+966 55 534 6560' },
    { type: 'email' as const, label: 'Email', value: 'info@aacpa.sa' },
  ],
  legal: {
    copyright: '© 2026 AA-CPA. SOCPA licence No. 522.',
    registry: ['CR: 1010469357', 'VAT: 310456789200003'],
    links: [{ label: 'Privacy policy', href: '/privacy' }],
  },
  backToTopLabel: 'Back to top',
  wordmark: 'ALSHABIBSHIRI',
};

afterEach(() => vi.restoreAllMocks());

describe('Footer', () => {
  it('is the contentinfo landmark on the dark inverse tone', () => {
    render(<Footer {...props} />);
    expect(screen.getByRole('contentinfo')).toHaveClass('bg-bg-inverse', 'text-text-inverse', 'pt-24');
  });

  it('renders the logo, description and labelled social links that open safely in a new tab', () => {
    render(<Footer {...props} />);
    expect(screen.getByRole('link', { name: 'Logo' })).toBeInTheDocument();
    expect(screen.getByText(props.description)).toBeInTheDocument();
    const socials = screen.getByRole('list', { name: 'Social media' });
    const linkedin = within(socials).getByRole('link', { name: 'LinkedIn' });
    expect(linkedin).toHaveAttribute('href', 'https://linkedin.com/x');
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer');
    expect(within(socials).getAllByRole('link')).toHaveLength(3);
  });

  it('link columns are navigation landmarks with a heading and a list of links', () => {
    render(<Footer {...props} />);
    const services = screen.getByRole('navigation', { name: 'Services' });
    expect(within(services).getByRole('heading', { name: 'Services', level: 2 })).toBeInTheDocument();
    expect(within(services).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getAllByRole('navigation')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Wiki' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('target');
  });

  it('contact values are links and left-to-right isolated', () => {
    render(<Footer {...props} />);
    const phone = screen.getByRole('link', { name: '+966 55 534 6560' });
    expect(phone).toHaveAttribute('href', 'tel:+966555346560');
    expect(phone.querySelector('bdi')).toHaveAttribute('dir', 'ltr');
    const email = screen.getByRole('link', { name: 'info@aacpa.sa' });
    expect(email).toHaveAttribute('href', 'mailto:info@aacpa.sa');
    expect(email.querySelector('bdi')).toHaveAttribute('dir', 'ltr');
  });

  it('renders no contact row without contacts', () => {
    render(<Footer {...props} contacts={[]} />);
    expect(screen.queryByText('Phone')).toBeNull();
  });

  it('legal row has copyright, registry entries separated decoratively, and legal links', () => {
    render(<Footer {...props} />);
    expect(screen.getByText(props.legal.copyright)).toBeInTheDocument();
    expect(screen.getByText('CR: 1010469357')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/privacy');
  });

  it('back-to-top scrolls smoothly, or instantly under prefers-reduced-motion', async () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    render(<Footer {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' });

    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ ...original(query), matches: true, media: query })) as typeof window.matchMedia;
    const { unmount } = render(<Footer {...props} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Back to top' })[1]!);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' });
    unmount();
    window.matchMedia = original;
  });

  it('the wordmark is decorative: aria-hidden, gradient clipped text', () => {
    render(<Footer {...props} />);
    const word = screen.getByText('ALSHABIBSHIRI');
    expect(word.parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(word).toHaveClass('bg-clip-text', 'text-transparent', 'from-text-inverse/90');
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Footer {...props} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Footer review fixes', () => {
  it('link columns are named by their titles even when the title has spaces', () => {
    render(<Footer {...props} />);
    expect(screen.getByRole('navigation', { name: 'Quick links' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Services' })).toBeInTheDocument();
  });

  it('never renders a script link from data', () => {
    render(
      <Footer
        {...props}
        socials={[{ network: 'linkedin', href: 'javascript:alert(1)', label: 'LinkedIn' }]}
        columns={[{ title: 'More', links: [{ label: 'Bad', href: 'javascript:alert(1)' }] }]}
        legal={{ ...props.legal, links: [{ label: 'Bad legal', href: 'data:text/html,x' }] }}
      />,
    );
    for (const a of document.querySelectorAll('a')) expect(a.getAttribute('href') ?? '').not.toMatch(/^(javascript|data):/i);
  });
});
