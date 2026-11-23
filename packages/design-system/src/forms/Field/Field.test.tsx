import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Field } from './Field';
import { TextInput } from '../TextInput';
import { Textarea } from '../Textarea';
import { Select } from '../Select';

describe('Field with TextInput', () => {
  it('associates the label with the control', () => {
    render(
      <Field id="name" label="Full name">
        <TextInput />
      </Field>,
    );
    const input = screen.getByLabelText('Full name');
    expect(input).toHaveAttribute('id', 'name');
    expect(input.tagName).toBe('INPUT');
  });

  it('marks required: asterisk hidden from assistive tech, required attribute on the control', () => {
    render(
      <Field id="name" label="Full name" required>
        <TextInput />
      </Field>,
    );
    expect(screen.getByLabelText(/Full name/)).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('links help text with aria-describedby', () => {
    render(
      <Field id="mobile" label="Mobile" help="Saudi number, e.g. 05xxxxxxxx">
        <TextInput />
      </Field>,
    );
    const input = screen.getByLabelText('Mobile');
    expect(input).toHaveAccessibleDescription('Saudi number, e.g. 05xxxxxxxx');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('error sets aria-invalid and is described by the error and the help text', () => {
    render(
      <Field id="email" label="Email" help="We never share it" error="Enter a valid email">
        <TextInput />
      </Field>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('We never share it Enter a valid email');
    expect(screen.getByText('We never share it')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email')).toHaveClass('text-status-error', 'text-body-xs');
  });

  it('keeps a caller-provided aria-describedby', () => {
    render(
      <Field id="x" label="X" help="Help">
        <TextInput aria-describedby="extra" />
      </Field>,
    );
    expect(screen.getByLabelText('X').getAttribute('aria-describedby')).toBe('extra x-help');
  });
});

describe('controls', () => {
  it('TextInput is 56 px high with 12 px radius and the placeholder token', () => {
    render(<TextInput aria-label="t" placeholder="Name" />);
    expect(screen.getByLabelText('t')).toHaveClass('h-14', 'rounded-field', 'placeholder:text-neutral-500', 'border-neutral-200');
  });

  it('TextInput dark theme follows the estimator display field', () => {
    render(<TextInput aria-label="t" theme="dark" />);
    expect(screen.getByLabelText('t')).toHaveClass('bg-bg-inverse-raised', 'border-border-inverse-strong', 'text-text-inverse', 'text-h4');
  });

  it('Textarea is 130 px high', () => {
    render(<Textarea aria-label="m" />);
    const el = screen.getByLabelText('m');
    expect(el.tagName).toBe('TEXTAREA');
    expect(el).toHaveClass('min-h-32.5', 'rounded-field');
  });

  it('Select is native, labelled, with a decorative end chevron and no mirroring', () => {
    const { container } = render(
      <Field id="service" label="Service">
        <Select>
          <option value="">Choose</option>
          <option value="audit">Audit</option>
        </Select>
      </Field>,
    );
    const select = screen.getByLabelText('Service');
    expect(select.tagName).toBe('SELECT');
    expect(screen.getAllByRole('option')).toHaveLength(2);
    const chevron = container.querySelector('svg')!;
    expect(chevron).toHaveAttribute('aria-hidden', 'true');
    expect(chevron).toHaveClass('end-4', 'rotate-90');
    expect(chevron).not.toHaveClass('rtl:-scale-x-100');
  });

  it('merges className and forwards refs', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TextInput aria-label="t" className="mt-2" ref={ref} />);
    expect(screen.getByLabelText('t')).toHaveClass('mt-2');
    expect(ref.current?.tagName).toBe('INPUT');
  });

  it.each(['ar', 'en'])('has no axe violations in %s (light, error, dark, textarea, select)', async (lang) => {
    const { container } = render(
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Field id="a" label="A" help="help">
          <TextInput />
        </Field>
        <Field id="b" label="B" error="bad" required>
          <TextInput />
        </Field>
        <Field id="c" label="C" theme="dark">
          <TextInput theme="dark" />
        </Field>
        <Field id="d" label="D">
          <Textarea />
        </Field>
        <Field id="e" label="E">
          <Select>
            <option>One</option>
          </Select>
        </Field>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('keeps the help text and its describedby id when an error is shown', () => {
    render(
      <Field id="mobile" label="Mobile" help="Start with 05" error="Invalid mobile">
        <input />
      </Field>,
    );
    const input = screen.getByLabelText('Mobile');
    expect(screen.getByText('Start with 05')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby', 'mobile-help mobile-error');
  });

  it('announce={false} keeps the error text but drops role=alert (a summary announces it)', () => {
    render(
      <Field id="n" label="Name" error="Required" announce={false}>
        <input />
      </Field>,
    );
    expect(screen.getByText('Required')).not.toHaveAttribute('role');
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
  });
});
