import * as React from 'react';
import { StateMessage, type StateMessageProps } from '../StateMessage';

export type EmptyStateProps = Omit<StateMessageProps, 'role'>;

/**
 * Empty list content (no articles, no open jobs): title, explanation, optional link. Server-safe: it renders text and a link only. Put a client "try again" button in `children`.
 *
 * @figma not in the approved frames (Page 1): behaviour designed in 003, pending client review (spec FR-009).
 */
export const EmptyState = React.forwardRef<HTMLElement, EmptyStateProps>((props, ref) => <StateMessage ref={ref} role="status" {...props} />);
EmptyState.displayName = 'EmptyState';
