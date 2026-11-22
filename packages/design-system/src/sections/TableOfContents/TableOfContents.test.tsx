import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { TableOfContents } from './TableOfContents';

const items = [
  { id: 's1', label: 'Organise your accounting records' },
  { id: 's2', label: 'Prepare supporting documents' },
  { id: 's3', label: 'Appoint one contact person' },
];

const original = globalThis.IntersectionObserver;
afterEach(() => {
  globalThis.IntersectionObserver = original;
  document.body.innerHTML = '';
});

describe('TableOfContents', () => {
  it('is a labelled navigation with an H2 and an ordered list of in-page links with gold two-digit numbers', () => {
    render(<TableOfContents title="In this article" label="Table of contents" items={items} locale="en" />);
    expect(screen.getByRole('navigation', { name: 'Table of contents' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'In this article' })).toHaveClass('text-h6');
    expect(screen.getByRole('list').tagName).toBe('OL');
    expect(screen.getByRole('link', { name: items[1]!.label })).toHaveAttribute('href', '#s2');
    expect(screen.getByText('01')).toHaveClass('text-text-accent', 'font-bold');
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('marks the first row active with the 3 px emerald indicator and aria-current', () => {
    const { container } = render(<TableOfContents title="T" label="L" items={items} locale="en" />);
    expect(screen.getByRole('link', { name: items[0]!.label })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: items[0]!.label })).toHaveClass('font-bold', 'text-text-heading');
    expect(container.querySelectorAll('[data-indicator]')).toHaveLength(1);
    expect(container.querySelector('[data-indicator]')).toHaveClass('bg-emerald-600', 'w-0.75');
  });

  it('follows scrolling: the section reported by IntersectionObserver becomes active', () => {
    let callback: IntersectionObserverCallback = () => {};
    globalThis.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = '';
      thresholds = [];
    } as unknown as typeof IntersectionObserver;
    document.body.innerHTML = '<div id="s1"></div><div id="s2"></div><div id="s3"></div>';
    render(<TableOfContents title="T" label="L" items={items} locale="en" />, { container: document.body.appendChild(document.createElement('div')) });
    act(() => {
      callback([{ isIntersecting: true, target: document.getElementById('s3')!, boundingClientRect: { top: 10 } as DOMRectReadOnly } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(screen.getByRole('link', { name: items[2]!.label })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: items[0]!.label })).not.toHaveAttribute('aria-current');
  });

  it('activating a row focuses the section, scrolls it into view and makes it active', async () => {
    document.body.innerHTML = '<h2 id="s1">One</h2><h2 id="s2">Two</h2><h2 id="s3">Three</h2>';
    const scroll = vi.fn();
    document.getElementById('s2')!.scrollIntoView = scroll;
    render(<TableOfContents title="T" label="L" items={items} locale="en" />, { container: document.body.appendChild(document.createElement('div')) });
    await userEvent.click(screen.getByRole('link', { name: items[1]!.label }));
    expect(document.getElementById('s2')).toHaveFocus();
    expect(scroll).toHaveBeenCalled();
    expect(screen.getByRole('link', { name: items[1]!.label })).toHaveAttribute('aria-current', 'location');
  });

  it('falls back to the normal anchor behaviour when the section does not exist', async () => {
    render(<TableOfContents title="T" label="L" items={items} locale="en" />);
    await userEvent.click(screen.getByRole('link', { name: items[1]!.label }));
    expect(screen.getByRole('link', { name: items[1]!.label })).not.toHaveAttribute('aria-current');
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <TableOfContents title="In this article" label="Table of contents" items={items} locale={lang} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
