import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slot } from './slot';

describe('Slot', () => {
  it('merges className and passes props to the child element', () => {
    render(
      <Slot className="a" data-x="1">
        <a href="/x" className="b">
          go
        </a>
      </Slot>,
    );
    const link = screen.getByRole('link', { name: 'go' });
    expect(link).toHaveClass('a', 'b');
    expect(link).toHaveAttribute('data-x', '1');
    expect(link).toHaveAttribute('href', '/x');
  });

  it('calls both click handlers, child first', async () => {
    const calls: string[] = [];
    const slotClick = vi.fn(() => calls.push('slot'));
    const childClick = vi.fn(() => calls.push('child'));
    render(
      <Slot onClick={slotClick}>
        <button onClick={childClick}>b</button>
      </Slot>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(calls).toEqual(['child', 'slot']);
  });

  it('forwards a ref to the child element', () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <Slot ref={ref}>
        <span>x</span>
      </Slot>,
    );
    expect(ref.current?.tagName).toBe('SPAN');
  });

  it('lets the child override non-merged props', () => {
    render(
      <Slot title="slot">
        <span title="child">x</span>
      </Slot>,
    );
    expect(screen.getByText('x')).toHaveAttribute('title', 'child');
  });
});
