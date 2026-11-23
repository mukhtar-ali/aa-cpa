import * as React from 'react';
import { cn } from '../../lib/cn';
import { Container } from '../../layout/Container';
import { Heading } from '../../primitives/Heading';
import { Button } from '../../primitives/Button';

export interface StateAction {
  label: string;
  href: string;
}

export interface StateMessageProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  body?: string;
  /** Link-style call to action. For a button that needs a handler (retry), pass `children` from a client component. */
  action?: StateAction;
  /** Heading level of the title; default 1 because these are usually the whole page. */
  level?: 1 | 2 | 3;
  /** Small label above the title, for example "404". */
  eyebrow?: string;
  /** `alert` and `status` announce the message to screen readers. */
  role?: 'alert' | 'status';
}

/** Shared layout of ErrorState, EmptyState and FormSuccess: centred title, body and one action. Not exported from the package index. */
export const StateMessage = React.forwardRef<HTMLElement, StateMessageProps>(
  ({ title, body, action, level = 1, eyebrow, className, children, ...props }, ref) => (
    <section ref={ref} className={cn('bg-bg-page py-24', className)} {...props}>
      <Container className="flex max-w-2xl flex-col items-center gap-6 text-center">
        {eyebrow ? <p className="text-body-sm font-bold text-text-accent">{eyebrow}</p> : null}
        <Heading level={level} size="h2">
          {title}
        </Heading>
        {body ? <p className="text-body-lg text-text-body">{body}</p> : null}
        {action ? (
          <Button href={action.href} variant="primary">
            {action.label}
          </Button>
        ) : null}
        {children}
      </Container>
    </section>
  ),
);
StateMessage.displayName = 'StateMessage';
