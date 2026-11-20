import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Icon } from './Icon';
import { iconMeta, iconNames } from './generated';
import { DIRECTIONAL } from '../../scripts/build-icons.mjs';

describe('Icon', () => {
  it('is decorative by default: aria-hidden, not focusable, no role', () => {
    const { container } = render(<Icon name="phone" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).not.toHaveAttribute('role');
  });

  it('with a title it is an image with an accessible name', () => {
    render(<Icon name="phone" title="Call us" />);
    const img = screen.getByRole('img', { name: 'Call us' });
    expect(img).not.toHaveAttribute('aria-hidden');
    expect(img.querySelector('title')).toHaveTextContent('Call us');
  });

  it('renders at the native Figma size by default and honours size', () => {
    const { container, rerender } = render(<Icon name="phone" />);
    const svg = () => container.querySelector('svg')!;
    expect(svg()).toHaveAttribute('width', String(iconMeta.phone.size));
    expect(svg()).toHaveAttribute('height', String(iconMeta.phone.size));
    rerender(<Icon name="phone" size={32} />);
    expect(svg()).toHaveAttribute('width', '32');
    expect(svg()).toHaveAttribute('height', '32');
  });

  it('mirrors in RTL only for directional icons (or when forced)', () => {
    const { container, rerender } = render(<Icon name="phone" />);
    const svg = () => container.querySelector('svg')!;
    expect(svg()).not.toHaveClass('rtl:-scale-x-100');
    rerender(<Icon name="phone" mirror />);
    expect(svg()).toHaveClass('rtl:-scale-x-100');
  });

  it('marks exactly the listed directional icons for mirroring', () => {
    for (const name of iconNames) {
      expect(iconMeta[name].directional, name).toBe(DIRECTIONAL.has(name));
    }
    for (const name of ['arrow', 'chevron']) expect(DIRECTIONAL.has(name)).toBe(true);
  });

  it('merges className and forwards other props', () => {
    const { container } = render(<Icon name="mail" className="text-text-link" data-testid="x" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveClass('shrink-0', 'text-text-link');
    expect(svg).toHaveAttribute('data-testid', 'x');
  });

  it('contains no hard-coded colours except token variables and currentColor', () => {
    for (const name of iconNames) {
      const { container, unmount } = render(<Icon name={name} />);
      const html = container.innerHTML;
      expect(html, name).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      unmount();
    }
  });

  it.each(iconNames.map((n) => [n]))('%s has no axe violations (decorative and named, RTL)', async (name) => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <Icon name={name} />
        <Icon name={name} title="label" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
