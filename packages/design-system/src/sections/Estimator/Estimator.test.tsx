import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import type { EstimatorConfig } from '../../types';
import { Estimator, toDigits } from './Estimator';

const labels = {
  progress: 'Question {n} of {total}',
  next: 'Next',
  back: 'Back',
  start: 'Start estimate',
  result: 'Your estimated range',
  disclaimer: 'The result is an estimate only and not a commitment.',
  restart: 'Start over',
  invalid: 'Enter a valid answer',
  error: 'Something went wrong, please try again',
};

function makeConfig(overrides: Partial<EstimatorConfig> = {}): EstimatorConfig {
  return {
    questions: [
      { id: 'revenue', prompt: 'Approximate annual revenue (SAR)', kind: 'currency', hint: 'An approximate number is fine', min: 1 },
      { id: 'staff', prompt: 'Number of employees', kind: 'number', min: 1, max: 10000 },
      { id: 'sector', prompt: 'Sector', kind: 'choice', options: [{ value: 'retail', label: 'Retail' }, { value: 'industry', label: 'Industry' }] },
      { id: 'deadline', prompt: 'Deadline', kind: 'choice', options: [{ value: 'soon', label: 'Within a month' }, { value: 'later', label: 'Later' }] },
    ],
    labels,
    currency: 'SAR',
    estimate: vi.fn().mockResolvedValue({ min: 100000, max: 150000 }),
    quote: {
      label: 'Request a formal quote',
      fields: { name: 'Full name', mobile: 'Mobile', email: 'Email', consent: 'I agree to be contacted' },
      submitLabel: 'Send request',
      successMessage: 'Thank you, we will contact you soon.',
      onSubmit: vi.fn().mockResolvedValue(undefined),
    },
    ...overrides,
  };
}

const setup = (config = makeConfig(), locale: 'ar' | 'en' = 'en') =>
  render(
    <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Estimator title="Not ready to talk yet? Get a number in 60 seconds" intro="Answer four questions for an indicative estimate." config={config} locale={locale} />
    </div>,
  );

async function answerAll() {
  await userEvent.type(screen.getByLabelText('Approximate annual revenue (SAR)'), '12000000');
  await userEvent.click(screen.getByRole('button', { name: 'Start estimate' }));
  await userEvent.type(screen.getByLabelText('Number of employees'), '85');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  await userEvent.click(screen.getByRole('radio', { name: 'Retail' }));
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  await userEvent.click(screen.getByRole('radio', { name: 'Within a month' }));
  await userEvent.click(screen.getByRole('button', { name: 'Your estimated range' }));
}

describe('toDigits', () => {
  it('converts Arabic-Indic and Persian digits and drops everything else', () => {
    expect(toDigits('٥٠٠٬٠٠٠')).toBe('500000');
    expect(toDigits('۱۲ ۳,4')).toBe('1234');
    expect(toDigits('abc')).toBe('');
  });
});

describe('Estimator', () => {
  it('starts on question 1 with progress text, progressbar at 25 % and the start button', () => {
    setup();
    expect(screen.getByText('Question 1 of 4')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(screen.getByLabelText('Approximate annual revenue (SAR)')).toBeInTheDocument();
    expect(screen.getByText('An approximate number is fine')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start estimate' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    expect(screen.getByText(labels.disclaimer)).toBeInTheDocument();
  });

  it('is the dark card with the H3-level title', () => {
    const { container } = setup();
    expect(container.querySelector('.bg-bg-inverse')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('text-h4');
  });

  it('an empty answer keeps the step and announces the error', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Start estimate' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid answer');
    expect(screen.getByLabelText('Approximate annual revenue (SAR)')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Question 1 of 4')).toBeInTheDocument();
  });

  it('formats currency answers with group separators and accepts Arabic digits', async () => {
    setup(undefined, 'ar');
    const input = screen.getByLabelText('Approximate annual revenue (SAR)');
    await userEvent.type(input, '٥٠٠٠٠٠');
    expect(input).toHaveValue('500,000');
  });

  it('a valid answer advances, progress follows, and back keeps the earlier answer', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Approximate annual revenue (SAR)'), '250000');
    await userEvent.click(screen.getByRole('button', { name: 'Start estimate' }));
    expect(screen.getByText('Question 2 of 4')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Question 1 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Approximate annual revenue (SAR)')).toHaveValue('250,000');
  });

  it('enforces min and max for number questions', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Approximate annual revenue (SAR)'), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Start estimate' }));
    await userEvent.type(screen.getByLabelText('Number of employees'), '20000');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid answer');
    expect(screen.getByText('Question 2 of 4')).toBeInTheDocument();
  });

  it('choice questions are a radio group and need a selection', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Approximate annual revenue (SAR)'), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Start estimate' }));
    await userEvent.type(screen.getByLabelText('Number of employees'), '5');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('group', { name: 'Sector' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid answer');
    await userEvent.click(screen.getByRole('radio', { name: 'Industry' }));
    expect(screen.getByRole('radio', { name: 'Industry' })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Question 4 of 4')).toBeInTheDocument();
  });

  it('the last question shows the result button, estimates with all answers, and shows the range', async () => {
    const config = makeConfig();
    setup(config);
    await answerAll();
    await screen.findByText('Your estimated range');
    expect(config.estimate).toHaveBeenCalledWith({ revenue: 12000000, staff: 85, sector: 'retail', deadline: 'soon' });
    expect(screen.getByText(/100,000/).closest('p')).toHaveTextContent(/SAR\s?100,000.*SAR\s?150,000/);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText(labels.disclaimer)).toBeInTheDocument();
  });

  it('moves focus to the step region when the step changes', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Approximate annual revenue (SAR)'), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Start estimate' }));
    expect(document.activeElement?.getAttribute('tabindex')).toBe('-1');
  });

  it('an estimate failure is announced and keeps the last question', async () => {
    setup(makeConfig({ estimate: vi.fn().mockRejectedValue(new Error('x')) }));
    await answerAll();
    expect(await screen.findByText(labels.error)).toBeInTheDocument();
    expect(screen.getByText('Question 4 of 4')).toBeInTheDocument();
  });

  it('an estimate failure on a numeric last question shows the message once', async () => {
    setup(
      makeConfig({
        questions: [
          { id: 'revenue', prompt: 'Approximate annual revenue (SAR)', kind: 'currency', min: 1 },
          { id: 'staff', prompt: 'Number of employees', kind: 'number', min: 1, max: 10000 },
        ],
        estimate: vi.fn().mockRejectedValue(new Error('x')),
      }),
    );
    await userEvent.type(screen.getByLabelText('Approximate annual revenue (SAR)'), '12000000');
    await userEvent.click(screen.getByRole('button', { name: 'Start estimate' }));
    await userEvent.type(screen.getByLabelText('Number of employees'), '85');
    await userEvent.click(screen.getByRole('button', { name: 'Your estimated range' }));
    await screen.findByText(labels.error);
    expect(screen.getAllByText(labels.error)).toHaveLength(1);
  });

  it('restart clears the answers and returns to question 1', async () => {
    setup();
    await answerAll();
    await userEvent.click(await screen.findByRole('button', { name: 'Start over' }));
    expect(screen.getByText('Question 1 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Approximate annual revenue (SAR)')).toHaveValue('');
  });

  it('the formal quote step validates, submits with answers and range, and confirms', async () => {
    const config = makeConfig();
    setup(config);
    await answerAll();
    await userEvent.click(await screen.findByRole('button', { name: 'Request a formal quote' }));
    await userEvent.click(screen.getByRole('button', { name: 'Send request' }));
    // Each invalid field carries its own error (name, mobile, email, consent).
    expect(screen.getAllByRole('alert').filter((el) => el.textContent === 'Enter a valid answer').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByLabelText(/Mobile/)).toHaveAttribute('aria-invalid', 'true');
    expect(config.quote!.onSubmit).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText(/Full name/), 'Omar Al-Salem');
    await userEvent.type(screen.getByLabelText(/Mobile/), '0555346560');
    await userEvent.type(screen.getByLabelText(/Email/), 'omar@example.com');
    await userEvent.click(screen.getByRole('checkbox', { name: 'I agree to be contacted' }));
    await userEvent.click(screen.getByRole('button', { name: 'Send request' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Thank you, we will contact you soon.'));
    expect(config.quote!.onSubmit).toHaveBeenCalledWith(
      { name: 'Omar Al-Salem', mobile: '0555346560', email: 'omar@example.com', consent: true },
      { revenue: 12000000, staff: 85, sector: 'retail', deadline: 'soon' },
      { min: 100000, max: 150000 },
    );
  });

  it('rejects a malformed mobile number and email in the quote form with field errors', async () => {
    const config = makeConfig();
    setup(config);
    await answerAll();
    await userEvent.click(await screen.findByRole('button', { name: 'Request a formal quote' }));
    await userEvent.type(screen.getByLabelText(/Full name/), 'Omar');
    await userEvent.type(screen.getByLabelText(/Mobile/), 'x');
    await userEvent.type(screen.getByLabelText(/Email/), 'a');
    await userEvent.click(screen.getByRole('checkbox', { name: 'I agree to be contacted' }));
    await userEvent.click(screen.getByRole('button', { name: 'Send request' }));
    expect(screen.getByLabelText(/Mobile/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Email/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Full name/)).not.toHaveAttribute('aria-invalid', 'true');
    expect(config.quote!.onSubmit).not.toHaveBeenCalled();
  });

  it('a decimal point or minus sign is rejected instead of being silently dropped', async () => {
    setup();
    const input = screen.getByLabelText('Approximate annual revenue (SAR)');
    await userEvent.type(input, '12');
    await userEvent.type(input, '.');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid answer');
    expect(input).toHaveValue('12');
    await userEvent.clear(input);
    await userEvent.type(input, '-');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid answer');
    expect(input).toHaveValue('');
  });

  it('going back clears a stale error from the previous question', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Approximate annual revenue (SAR)'), '12000000');
    await userEvent.click(screen.getByRole('button', { name: 'Start estimate' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('two estimators on one page do not share element ids', () => {
    const { container } = render(
      <div>
        <Estimator title="A" intro="a" config={makeConfig()} />
        <Estimator title="B" intro="b" config={makeConfig()} />
      </div>,
    );
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a quote submission failure is announced and the form stays', async () => {
    const config = makeConfig();
    config.quote!.onSubmit = vi.fn().mockRejectedValue(new Error('x'));
    setup(config);
    await answerAll();
    await userEvent.click(await screen.findByRole('button', { name: 'Request a formal quote' }));
    await userEvent.type(screen.getByLabelText(/Full name/), 'Omar');
    await userEvent.type(screen.getByLabelText(/Mobile/), '0555346560');
    await userEvent.type(screen.getByLabelText(/Email/), 'omar@example.com');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Send request' }));
    expect(await screen.findByText(labels.error)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send request' })).toBeInTheDocument();
  });

  it('without a quote config the result offers only restart', async () => {
    setup(makeConfig({ quote: undefined }));
    await answerAll();
    await screen.findByRole('button', { name: 'Start over' });
    expect(screen.queryByRole('button', { name: 'Request a formal quote' })).toBeNull();
  });

  it.each(['ar', 'en'] as const)('has no axe violations in %s (question, result and quote steps)', async (lang) => {
    const { container } = setup(undefined, lang);
    expect(await axe(container)).toHaveNoViolations();
    await answerAll();
    await screen.findByText('Your estimated range');
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole('button', { name: 'Request a formal quote' }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('an estimate that never settles ends in the failure message', async () => {
    setup(makeConfig({ timeoutMs: 50, estimate: () => new Promise(() => {}) }));
    await answerAll();
    expect(await screen.findByText(labels.error)).toBeInTheDocument();
    expect(screen.getByText('Question 4 of 4')).toBeInTheDocument();
  });

  it('Enter in the numeric input moves to the next question', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Approximate annual revenue (SAR)'), '12000000');
    await userEvent.click(screen.getByRole('button', { name: 'Start estimate' }));
    await userEvent.type(screen.getByLabelText('Number of employees'), '85{Enter}');
    expect(screen.getByText('Question 3 of 4')).toBeInTheDocument();
  });

  it('renders nothing without questions', () => {
    const { container } = setup(makeConfig({ questions: [] }));
    expect(container.querySelector('[role="group"]')).toBeNull();
  });

  it('isolates each amount of the result range as left-to-right text', async () => {
    const { container } = setup();
    await answerAll();
    await screen.findByText('Your estimated range');
    expect(container.querySelectorAll('p bdi[dir="ltr"]').length).toBe(2);
  });
});
