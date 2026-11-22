import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Text } from './Text';

describe('Text', () => {
  it('defaults to a body-md regular paragraph', () => {
    render(<Text>Hello</Text>);
    const el = screen.getByText('Hello');
    expect(el.tagName).toBe('P');
    expect(el).toHaveClass('text-body-md', 'font-normal', 'text-text-body');
  });

  it.each([
    ['lg', 'text-body-lg'],
    ['md', 'text-body-md'],
    ['sm', 'text-body-sm'],
    ['xs', 'text-body-xs'],
  ] as const)('maps size %s to %s', (size, cls) => {
    render(<Text size={size}>x</Text>);
    expect(screen.getByText('x')).toHaveClass(cls);
  });

  it.each([
    ['regular', 'font-normal'],
    ['bold', 'font-bold'],
    ['extrabold', 'font-extrabold'],
  ] as const)('maps weight %s to %s', (weight, cls) => {
    render(<Text weight={weight}>x</Text>);
    expect(screen.getByText('x')).toHaveClass(cls);
  });

  it.each([
    ['body', 'text-text-body'],
    ['muted', 'text-text-muted'],
    ['strong', 'text-text-strong'],
    ['inverse', 'text-text-inverse'],
    ['inverse-muted', 'text-text-inverse-muted'],
  ] as const)('maps tone %s to %s', (tone, cls) => {
    render(<Text tone={tone}>x</Text>);
    expect(screen.getByText('x')).toHaveClass(cls);
  });

  it('renders a different element with `as` and merges className', () => {
    render(
      <Text as="span" className="mt-2">
        x
      </Text>,
    );
    const el = screen.getByText('x');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('mt-2');
  });

  it.each(['ar', 'en'])('works in %s direction without violations', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Text>{lang === 'ar' ? 'نص تجريبي' : 'Sample text'}</Text>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
