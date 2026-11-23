import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  DesignSystemProvider,
  useDesignSystem,
} from './DesignSystemProvider';

function ConsumerComponent() {
  const { locale, dir } = useDesignSystem();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="dir">{dir}</span>
    </div>
  );
}

describe('DesignSystemProvider', () => {
  it('provides Arabic RTL context by default when locale is ar', () => {
    render(
      <DesignSystemProvider locale="ar">
        <ConsumerComponent />
      </DesignSystemProvider>,
    );

    expect(screen.getByTestId('locale').textContent).toBe('ar');
    expect(screen.getByTestId('dir').textContent).toBe('rtl');
  });

  it('provides English LTR context when locale is en', () => {
    render(
      <DesignSystemProvider locale="en">
        <ConsumerComponent />
      </DesignSystemProvider>,
    );

    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(screen.getByTestId('dir').textContent).toBe('ltr');
  });

  it('allows explicit dir override', () => {
    render(
      <DesignSystemProvider locale="en" dir="rtl">
        <ConsumerComponent />
      </DesignSystemProvider>,
    );

    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(screen.getByTestId('dir').textContent).toBe('rtl');
  });

  it('throws an error if useDesignSystem is used outside of provider', () => {
    // Suppress console.error for expected thrown error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ConsumerComponent />)).toThrow(
      'useDesignSystem must be used within a DesignSystemProvider',
    );
    spy.mockRestore();
  });

  it('warns in development when its direction differs from <html dir>', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.documentElement.dir = 'ltr';
    render(
      <DesignSystemProvider locale="ar">
        <span>x</span>
      </DesignSystemProvider>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('differs from <html dir'));
    document.documentElement.dir = '';
    warn.mockRestore();
  });
});
