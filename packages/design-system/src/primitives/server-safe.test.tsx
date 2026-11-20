import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import * as React from 'react';
import { Button } from './Button';
import { IconButton } from './IconButton';

/**
 * Server components cannot serialise event handlers, so components documented as server-safe must not attach one unless needed.
 * We check the element trees (before rendering to DOM) for function props on host elements.
 */
function hostElementsWithHandlers(node: React.ReactNode, found: string[] = []): string[] {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    const el = child as React.ReactElement<Record<string, unknown>>;
    if (typeof el.type === 'string') {
      for (const [key, value] of Object.entries(el.props)) if (key.startsWith('on') && typeof value === 'function') found.push(`${el.type}.${key}`);
    }
    hostElementsWithHandlers(el.props.children as React.ReactNode, found);
  });
  return found;
}

type ForwardRefLike = { render: (props: unknown, ref: unknown) => React.ReactElement };

/** Calls the forwardRef render function once to get the host element tree the component returns. */
function renderTree(element: React.ReactElement): React.ReactElement {
  const type = element.type as unknown as ForwardRefLike;
  return type.render(element.props, null);
}

describe('server-safe primitives', () => {
  it('Button without onClick/disabled/loading renders no event handler', () => {
    expect(hostElementsWithHandlers(renderTree(<Button href="/x">Go</Button>))).toEqual([]);
    expect(hostElementsWithHandlers(renderTree(<Button>Go</Button>))).toEqual([]);
    expect(renderToStaticMarkup(<Button href="/x">Go</Button>)).toContain('href="/x"');
  });

  it('Button attaches a handler only when disabled, loading or given one', () => {
    expect(hostElementsWithHandlers(renderTree(<Button disabled>Go</Button>))).toEqual(['button.onClick']);
    expect(hostElementsWithHandlers(renderTree(<Button loading>Go</Button>))).toEqual(['button.onClick']);
    expect(hostElementsWithHandlers(renderTree(<Button onClick={() => {}}>Go</Button>))).toEqual(['button.onClick']);
  });

  it('IconButton without onClick/disabled renders no event handler', () => {
    expect(hostElementsWithHandlers(renderTree(<IconButton label="x" icon="close" />))).toEqual([]);
    expect(hostElementsWithHandlers(renderTree(<IconButton label="x" icon="close" href="/x" />))).toEqual([]);
    expect(hostElementsWithHandlers(renderTree(<IconButton label="x" icon="close" disabled />))).toEqual(['button.onClick']);
  });
});
