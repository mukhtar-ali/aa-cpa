import * as React from 'react';
import { cn } from './cn';

type AnyProps = Record<string, unknown>;

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

/**
 * Minimal Radix-free Slot: merges its own props onto its single child element (className, style, refs and
 * event handlers are combined; the child's own props win for everything else). Powers `asChild`.
 */
export const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, ...slotProps }, forwardedRef) => {
    const child = React.Children.only(children);
    if (!React.isValidElement(child)) return null;
    const childProps = child.props as AnyProps;
    const merged: AnyProps = { ...slotProps, ...childProps };
    for (const key of Object.keys(slotProps)) {
      const slotValue = (slotProps as AnyProps)[key];
      const childValue = childProps[key];
      if (/^on[A-Z]/.test(key) && typeof slotValue === 'function' && typeof childValue === 'function') {
        merged[key] = (...args: unknown[]) => {
          (childValue as (...a: unknown[]) => void)(...args);
          (slotValue as (...a: unknown[]) => void)(...args);
        };
      }
    }
    merged.className = cn(slotProps.className, childProps.className as string | undefined);
    if (slotProps.style || childProps.style) {
      merged.style = { ...slotProps.style, ...(childProps.style as React.CSSProperties | undefined) };
    }
    merged.ref = composeRefs(forwardedRef, childProps.ref as React.Ref<HTMLElement> | undefined);
    return React.cloneElement(child, merged);
  },
);
Slot.displayName = 'Slot';
