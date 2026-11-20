import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('renders text for assistive technology with the sr-only class', () => {
    render(<VisuallyHidden>Skip</VisuallyHidden>);
    expect(screen.getByText('Skip')).toHaveClass('sr-only');
  });

  it('has no axe violations', async () => {
    const { container } = render(<VisuallyHidden>Skip</VisuallyHidden>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
