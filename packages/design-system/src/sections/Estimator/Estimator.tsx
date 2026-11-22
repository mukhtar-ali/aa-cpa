'use client';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { formatCurrency, formatNumber } from '../../lib/format';
import { isEmail, isSaudiMobile } from '../../lib/validators';
import { Checkbox } from '../../forms/Checkbox';
import { Field } from '../../forms/Field';
import { TextInput } from '../../forms/TextInput';
import { Button } from '../../primitives/Button';
import type { EstimatorConfig, EstimatorQuestion } from '../../types';

type Answers = Record<string, string | number>;
type Step = { kind: 'question'; index: number } | { kind: 'estimating'; index: number } | { kind: 'result' } | { kind: 'quote' } | { kind: 'sent' };

export interface EstimatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string;
  intro: string;
  config: EstimatorConfig;
  locale?: 'ar' | 'en';
}

/** Converts Arabic-Indic and Persian digits to Western digits and keeps digits only. */
export function toDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, '');
}

function validate(question: EstimatorQuestion, answers: Answers): boolean {
  const value = answers[question.id];
  if (value === undefined || value === '') return false;
  if (question.kind === 'choice') return (question.options ?? []).some((option) => option.value === value);
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return false;
  if (question.min !== undefined && n < question.min) return false;
  if (question.max !== undefined && n > question.max) return false;
  return true;
}

/**
 * Cost estimator (Figma 411:3855): dark card with progress, one question per step, validation, an estimated range as result, and an
 * optional "request a formal quote" form. State machine: question(0..n-1) -> estimating -> result -> (quote -> sent) | restart.
 * Invalid answers keep the step and announce the error; failures of the estimate or the quote are announced too.
 *
 * @figma 411:3854, 411:3855
 */
export function Estimator({ title, intro, config, locale = 'ar', className, ...props }: EstimatorProps) {
  const { questions, labels, quote } = config;
  const total = questions.length;
  const [step, setStep] = React.useState<Step>({ kind: 'question', index: 0 });
  const [answers, setAnswers] = React.useState<Answers>({});
  const [error, setError] = React.useState('');
  const [range, setRange] = React.useState<{ min: number; max: number } | null>(null);
  const [form, setForm] = React.useState({ name: '', mobile: '', email: '', consent: false });
  const [submitting, setSubmitting] = React.useState(false);
  const regionRef = React.useRef<HTMLDivElement>(null);
  const uid = React.useId();
  const [quoteErrors, setQuoteErrors] = React.useState<{ name?: boolean; mobile?: boolean; email?: boolean; consent?: boolean }>({});
  // Move focus to the region when the step changes, but not on mount (React StrictMode re-runs effects in development).
  const stepKey = step.kind === 'question' || step.kind === 'estimating' ? `${step.kind}-${step.index}` : step.kind;
  const lastStepKey = React.useRef(stepKey);
  React.useEffect(() => {
    if (lastStepKey.current === stepKey) return;
    lastStepKey.current = stepKey;
    if (!stepKey.startsWith('estimating')) regionRef.current?.focus();
  }, [stepKey]);

  const index = step.kind === 'question' || step.kind === 'estimating' ? step.index : total - 1;
  const question = questions[index];
  const progressText = labels.progress.replace('{n}', formatNumber(Math.min(index + 1, total), locale)).replace('{total}', formatNumber(total, locale));
  const progressPct = step.kind === 'result' || step.kind === 'quote' || step.kind === 'sent' ? 100 : ((index + 1) / total) * 100;

  const next = async () => {
    if (!question || step.kind !== 'question') return;
    if (!validate(question, answers)) {
      setError(labels.invalid);
      return;
    }
    setError('');
    if (index < total - 1) {
      setStep({ kind: 'question', index: index + 1 });
      return;
    }
    setStep({ kind: 'estimating', index });
    try {
      setRange(await config.estimate(answers));
      setStep({ kind: 'result' });
    } catch {
      setError(labels.error);
      setStep({ kind: 'question', index });
    }
  };

  const restart = () => {
    setAnswers({});
    setRange(null);
    setError('');
    setForm({ name: '', mobile: '', email: '', consent: false });
    setQuoteErrors({});
    setStep({ kind: 'question', index: 0 });
  };

  const submitQuote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!quote || !range || submitting) return;
    const found = {
      name: !form.name.trim() || undefined,
      mobile: !isSaudiMobile(form.mobile) || undefined,
      email: !isEmail(form.email) || undefined,
      consent: !form.consent || undefined,
    };
    setQuoteErrors(found);
    if (found.name || found.mobile || found.email || found.consent) {
      setError(labels.invalid);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await quote.onSubmit({ ...form, name: form.name.trim(), email: form.email.trim() }, answers, range);
      setStep({ kind: 'sent' });
    } catch {
      setError(labels.error);
    } finally {
      setSubmitting(false);
    }
  };

  const setAnswer = (q: EstimatorQuestion, raw: string) => {
    setError('');
    if (q.kind === 'choice') return setAnswers((a) => ({ ...a, [q.id]: raw }));
    // Whole numbers only: a decimal point or a minus sign would otherwise be silently dropped ("12.5" -> 125, "-5" -> 5).
    if (/[.\u066B-]/.test(raw)) return setError(labels.invalid);
    const digits = toDigits(raw);
    setAnswers((a) => {
      const copy = { ...a };
      if (digits === '') delete copy[q.id];
      else copy[q.id] = Number(digits);
      return copy;
    });
  };

  const inputId = question ? `${uid}-${question.id}` : uid;
  const answered = question ? answers[question.id] : undefined;

  return (
    <div className={cn('flex flex-col gap-6 rounded-thumb bg-bg-inverse p-12 text-text-inverse', className)} {...props}>
      <h3 className="text-h4">{title}</h3>

      <div className="flex flex-col gap-2">
        <p aria-live="polite" className="text-body-sm">
          {progressText}
        </p>
        <div role="progressbar" aria-label={progressText} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct)} className="h-1 w-full overflow-hidden bg-bg-inverse-raised">
          <div className="h-full bg-accent-progress" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div ref={regionRef} role="group" aria-label={title} tabIndex={-1} className="flex flex-col gap-6 outline-none">
        {step.kind === 'question' || step.kind === 'estimating' ? (
          question ? (
            <>
              <p className="text-body-lg">{intro}</p>
              {question.kind === 'choice' ? (
                <fieldset className="flex flex-col gap-3" disabled={step.kind === 'estimating'}>
                  <legend className="mb-3 text-body-sm">{question.prompt}</legend>
                  {(question.options ?? []).map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-thumb border border-solid border-border-inverse-strong px-4 py-3 has-checked:bg-bg-inverse-raised">
                      <input type="radio" name={inputId} value={option.value} checked={answered === option.value} onChange={() => setAnswer(question, option.value)} className="size-4" />
                      <span className="text-body-md">{option.label}</span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <Field id={inputId} label={question.prompt} theme="dark" help={question.hint} error={error && step.kind === 'question' ? error : undefined}>
                  <TextInput
                    theme="dark"
                    inputMode="numeric"
                    autoComplete="off"
                    dir="ltr"
                    placeholder={question.placeholder}
                    disabled={step.kind === 'estimating'}
                    value={typeof answered === 'number' ? formatNumber(answered, locale) : ''}
                    onChange={(e) => setAnswer(question, e.target.value)}
                  />
                </Field>
              )}
              {question.kind === 'choice' && error ? (
                <p role="alert" className="text-body-sm text-status-error-inverse">
                  {error}
                </p>
              ) : null}
              <div className="flex items-center gap-4">
                <Button variant="paper" onClick={next} loading={step.kind === 'estimating'}>
                  {index === 0 ? labels.start : index === total - 1 ? labels.result : labels.next}
                </Button>
                {index > 0 ? (
                  <Button variant="link" disabled={step.kind === 'estimating'} onClick={() => {
                      setError('');
                      setStep({ kind: 'question', index: index - 1 });
                    }}>
                    {labels.back}
                  </Button>
                ) : null}
              </div>
            </>
          ) : null
        ) : null}

        {step.kind === 'result' && range ? (
          <>
            <p className="text-body-lg">{labels.result}</p>
            <p className="bg-linear-to-b from-gradient-start to-gradient-end-text-large bg-clip-text text-h3 font-bold text-transparent" dir="ltr">
              {formatCurrency(range.min, locale, config.currency, { maximumFractionDigits: 0 })} – {formatCurrency(range.max, locale, config.currency, { maximumFractionDigits: 0 })}
            </p>
            <div className="flex items-center gap-4">
              {quote ? (
                <Button variant="paper" onClick={() => setStep({ kind: 'quote' })}>
                  {quote.label}
                </Button>
              ) : null}
              <Button variant="link" onClick={restart}>
                {labels.restart}
              </Button>
            </div>
          </>
        ) : null}

        {step.kind === 'quote' && quote ? (
          <form onSubmit={submitQuote} noValidate className="flex flex-col gap-5">
            <p className="text-body-lg">{quote.label}</p>
            <Field id={`${uid}-name`} label={quote.fields.name} theme="dark" required error={quoteErrors.name ? labels.invalid : undefined}>
              <TextInput theme="dark" autoComplete="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field id={`${uid}-mobile`} label={quote.fields.mobile} theme="dark" required error={quoteErrors.mobile ? labels.invalid : undefined}>
              <TextInput theme="dark" type="tel" autoComplete="tel" dir="ltr" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
            </Field>
            <Field id={`${uid}-email`} label={quote.fields.email} theme="dark" required error={quoteErrors.email ? labels.invalid : undefined}>
              <TextInput theme="dark" type="email" autoComplete="email" dir="ltr" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </Field>
            <Checkbox id={`${uid}-consent`} error={quoteErrors.consent ? labels.invalid : undefined} label={<span className="text-text-inverse">{quote.fields.consent}</span>} checked={form.consent} onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))} />
            {error && error !== labels.invalid ? (
              <p role="alert" className="text-body-sm text-status-error-inverse">
                {error}
              </p>
            ) : null}
            <div className="flex items-center gap-4">
              <Button type="submit" variant="paper" loading={submitting}>
                {quote.submitLabel}
              </Button>
              <Button
                variant="link"
                onClick={() => {
                  setError('');
                  setQuoteErrors({});
                  setStep({ kind: 'result' });
                }}
              >
                {labels.back}
              </Button>
            </div>
          </form>
        ) : null}

        {step.kind === 'sent' && quote ? (
          <>
            <p role="status" className="text-body-lg">
              {quote.successMessage}
            </p>
            <Button variant="link" onClick={restart} className="self-start">
              {labels.restart}
            </Button>
          </>
        ) : null}
      </div>

      <p className="text-body-sm">{labels.disclaimer}</p>
    </div>
  );
}
