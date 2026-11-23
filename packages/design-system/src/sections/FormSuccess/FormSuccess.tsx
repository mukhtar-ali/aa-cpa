import * as React from 'react';
import { StateMessage, type StateMessageProps } from '../StateMessage';

export type FormSuccessProps = Omit<StateMessageProps, 'role'>;

/**
 * Confirmation shown after a form is sent (contact, quote, application). Server-safe: it renders text and a link only. Put a client "try again" button in `children`.
 *
 * @figma not in the approved frames (Page 1): behaviour designed in 003, pending client review (spec FR-009).
 */
export const FormSuccess = React.forwardRef<HTMLElement, FormSuccessProps>((props, ref) => <StateMessage ref={ref} role="status" {...props} />);
FormSuccess.displayName = 'FormSuccess';
