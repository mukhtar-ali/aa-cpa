import * as React from 'react';
import { StateMessage, type StateMessageProps } from '../StateMessage';

export type ErrorStateProps = Omit<StateMessageProps, 'role'>;

/**
 * Error page content (failed load, 404, 500): title, explanation, way out. Server-safe: it renders text and a link only. Put a client "try again" button in `children`.
 *
 * @figma not in the approved frames (Page 1): behaviour designed in 003, pending client review (spec FR-009).
 */
export const ErrorState = React.forwardRef<HTMLElement, ErrorStateProps>((props, ref) => <StateMessage ref={ref} role="alert" {...props} />);
ErrorState.displayName = 'ErrorState';
