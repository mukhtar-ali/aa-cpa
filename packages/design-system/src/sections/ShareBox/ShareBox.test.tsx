import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ShareBox, shareLinks } from './ShareBox';

const labels = { copyLink: 'Copy link', whatsapp: 'Share on WhatsApp', linkedin: 'Share on LinkedIn', x: 'Share on X', copy: 'Copy', copied: 'Link copied' };
const props = { url: 'https://aacpa.sa/news/annual-audit', title: 'Enjoyed the article? Share it with colleagues', description: 'Help them prepare for the audit.', labels };

afterEach(() => vi.restoreAllMocks());

describe('shareLinks', () => {
  it('encodes the url and text', () => {
    const links = shareLinks('https://a.sa/x?y=1', 'Hello world');
    expect(links.whatsapp).toBe('https://wa.me/?text=Hello%20world%20https%3A%2F%2Fa.sa%2Fx%3Fy%3D1');
    expect(links.linkedin).toContain('url=https%3A%2F%2Fa.sa%2Fx%3Fy%3D1');
    expect(links.x).toContain('text=Hello%20world');
  });
});

describe('ShareBox', () => {
  it('bar variant: ice strip with H2 (H6 size), description and four 44 px buttons', () => {
    const { container } = render(<ShareBox {...props} />);
    expect(container.firstElementChild).toHaveClass('bg-bg-surface-ice', 'rounded-cta');
    expect(screen.getByRole('heading', { level: 2, name: props.title })).toHaveClass('text-h6');
    expect(screen.getByRole('button', { name: 'Copy link' })).toHaveClass('size-11');
    expect(screen.getByRole('link', { name: 'Share on WhatsApp' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Share on LinkedIn' }).getAttribute('href')).toContain('linkedin.com');
    expect(screen.getByRole('link', { name: 'Share on X' }).getAttribute('href')).toContain('x.com/intent');
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('card variant: dark card with a read-only left-to-right link field and a copy button', () => {
    const { container } = render(<ShareBox {...props} variant="card" />);
    expect(container.firstElementChild).toHaveClass('bg-bg-inverse', 'text-text-inverse');
    const field = screen.getByRole('textbox', { name: 'Copy link' });
    expect(field).toHaveValue(props.url);
    expect(field).toHaveAttribute('readonly');
    expect(field).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('copying writes the url to the clipboard and announces it politely', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<ShareBox {...props} variant="card" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(writeText).toHaveBeenCalledWith(props.url);
    expect(await screen.findByText('Link copied')).toHaveAttribute('role', 'status');
  });

  it('a clipboard failure does not announce success', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockRejectedValue(new Error('x')) }, configurable: true });
    render(<ShareBox {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(screen.queryByText('Link copied')).toBeNull();
  });

  it.each(['ar', 'en'])('has no axe violations in %s (bar and card)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <ShareBox {...props} />
        <ShareBox {...props} variant="card" title="Share the article" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
