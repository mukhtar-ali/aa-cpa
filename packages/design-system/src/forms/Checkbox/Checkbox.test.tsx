import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('is a labelled checkbox that toggles by clicking the label', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="I agree" onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'I agree' });
    expect(box).not.toBeChecked();
    await userEvent.click(screen.getByText('I agree'));
    expect(box).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('toggles with the keyboard', async () => {
    render(<Checkbox label="I agree" />);
    await userEvent.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('uses the Figma box: 20 px, 5 px radius, contrast-corrected border, emerald when checked', () => {
    render(<Checkbox label="x" />);
    expect(screen.getByRole('checkbox')).toHaveClass('size-5', 'rounded-checkbox', 'border-neutral-300', 'checked:bg-emerald-600');
  });

  it('shows a decorative check icon', () => {
    const { container } = render(<Checkbox label="x" defaultChecked />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('the label can contain a link', () => {
    render(<Checkbox label={<>I accept the <a href="/terms">terms</a></>} />);
    expect(screen.getByRole('link', { name: 'terms' })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('error: aria-invalid, described by the message', () => {
    render(<Checkbox label="I agree" error="You must accept" />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription('You must accept');
  });

  it('disabled cannot be toggled', async () => {
    render(<Checkbox label="x" disabled />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it.each(['ar', 'en'])('has no axe violations in %s', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Checkbox label={lang === 'ar' ? 'أوافق على الشروط' : 'I agree'} />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Err" error="Required" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
