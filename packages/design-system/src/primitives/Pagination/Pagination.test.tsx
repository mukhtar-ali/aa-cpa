import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Pagination, pageItems } from './Pagination';

const labels = { nav: 'Pagination', previous: 'Previous page', next: 'Next page', page: (n: number) => `Page ${n}` };

describe('pageItems', () => {
  it('lists every page up to 7', () => {
    expect(pageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageItems(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('collapses the middle for long ranges', () => {
    expect(pageItems(1, 20)).toEqual([1, 2, 'gap-end', 20]);
    expect(pageItems(10, 20)).toEqual([1, 'gap-start', 9, 10, 11, 'gap-end', 20]);
    expect(pageItems(20, 20)).toEqual([1, 'gap-start', 19, 20]);
  });
});

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pageCount={1} labels={labels} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('link mode: a labelled nav with real links and aria-current on the current page', () => {
    render(<Pagination page={2} pageCount={5} hrefFor={(n) => `/blog?page=${n}`} labels={labels} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    const current = screen.getByRole('link', { name: 'Page 2' });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('href', '/blog?page=2');
    expect(current).toHaveClass('bg-bg-inverse', 'text-text-inverse', 'h-10', 'rounded-full');
    expect(screen.getByRole('link', { name: 'Page 3' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Previous page' })).toHaveAttribute('href', '/blog?page=1');
    expect(screen.getByRole('link', { name: 'Next page' })).toHaveAttribute('href', '/blog?page=3');
  });

  it('first page disables previous, last page disables next', () => {
    const { rerender } = render(<Pagination page={1} pageCount={3} hrefFor={(n) => `/p/${n}`} labels={labels} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveAttribute('aria-disabled', 'true');
    rerender(<Pagination page={3} pageCount={3} hrefFor={(n) => `/p/${n}`} labels={labels} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('button mode calls onPageChange', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={5} onPageChange={onPageChange} labels={labels} />);
    await userEvent.click(screen.getByRole('button', { name: 'Page 4' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange.mock.calls.map((c) => c[0])).toEqual([4, 3, 1]);
  });

  it('previous and next chevrons point opposite ways and mirror in RTL', () => {
    const { container } = render(<Pagination page={2} pageCount={5} hrefFor={(n) => `/p/${n}`} labels={labels} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs[0]).toHaveClass('-scale-x-100', 'rtl:scale-x-100');
    expect(svgs[svgs.length - 1]).toHaveClass('rtl:-scale-x-100');
  });

  it('long ranges show decorative ellipses', () => {
    const { container } = render(<Pagination page={10} pageCount={20} hrefFor={(n) => `/p/${n}`} labels={labels} />);
    expect(container.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(2);
  });

  it.each(['ar', 'en'])('has no axe violations in %s (link and button mode)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Pagination page={2} pageCount={9} hrefFor={(n) => `/p/${n}`} labels={labels} />
        <Pagination page={5} pageCount={9} onPageChange={() => {}} labels={{ ...labels, nav: 'Pagination (buttons)' }} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Pagination review fixes', () => {
  it('an ellipsis never hides a single page', () => {
    expect(pageItems(4, 20)).toEqual([1, 2, 3, 4, 5, 'gap-end', 20]);
    expect(pageItems(17, 20)).toEqual([1, 'gap-start', 16, 17, 18, 19, 20]);
  });

  it('an out-of-range page is clamped so Previous and Next never point at a missing page', () => {
    render(<Pagination page={99} pageCount={5} hrefFor={(n) => `/p/${n}`} labels={labels} />);
    expect(screen.getByRole('link', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Previous page' })).toHaveAttribute('href', '/p/4');
  });
});
