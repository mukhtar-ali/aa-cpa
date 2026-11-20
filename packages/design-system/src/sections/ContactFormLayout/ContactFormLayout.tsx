'use client';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { isEmail, isSaudiMobile } from '../../lib/validators';
import { Checkbox } from '../../forms/Checkbox';
import { Field } from '../../forms/Field';
import { FormErrorSummary } from '../../forms/FormErrorSummary';
import { Select } from '../../forms/Select';
import { TextInput } from '../../forms/TextInput';
import { Textarea } from '../../forms/Textarea';
import { Button } from '../../primitives/Button';

export interface ContactFormValues {
  name: string;
  mobile: string;
  email: string;
  service: string;
  message: string;
  consent: boolean;
  /** Honeypot: must stay empty; bots fill it. */
  website: string;
  /** Milliseconds between the form being shown and submitted (too-fast submissions are bot-like). */
  elapsedMs: number;
}

export interface ContactFormLabels {
  name: string;
  mobile: string;
  email: string;
  service: string;
  servicePlaceholder: string;
  message: string;
  consent: React.ReactNode;
  submit: string;
  required: string;
  invalidMobile: string;
  invalidEmail: string;
  summaryTitle: string;
  success: string;
  failure: string;
}

export interface ContactFormLayoutProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'onSubmit'> {
  title: string;
  description?: string;
  labels: ContactFormLabels;
  services: { value: string; label: string }[];
  onSubmit: (values: ContactFormValues) => Promise<void>;
  /** Side content (contact items, office cards) shown next to the form from `lg`. */
  aside?: React.ReactNode;
}

type Errors = Partial<Record<'name' | 'mobile' | 'email' | 'message' | 'consent', string>>;

/**
 * Contact form with its page layout: form at the inline start, optional aside at the end. Validates name, Saudi mobile, email, message and
 * consent, shows an error summary that takes focus, announces success or failure, and submits a honeypot field and the time spent so the
 * backend can reject bots. The form frame (524:3651) was too large to read: fields follow the shared control styles (to verify).
 *
 * @figma 524:3651 (unverified)
 */
export function ContactFormLayout({ title, description, labels, services, onSubmit, aside, className, ...props }: ContactFormLayoutProps) {
  const startedAt = React.useRef(Date.now());
  const [values, setValues] = React.useState({ name: '', mobile: '', email: '', service: '', message: '', consent: false, website: '' });
  const [errors, setErrors] = React.useState<Errors>({});
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'sent' | 'failed'>('idle');
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((v) => ({ ...v, [key]: value }));

  const validate = (): Errors => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = labels.required;
    if (!values.mobile.trim()) next.mobile = labels.required;
    else if (!isSaudiMobile(values.mobile)) next.mobile = labels.invalidMobile;
    if (!values.email.trim()) next.email = labels.required;
    else if (!isEmail(values.email)) next.email = labels.invalidEmail;
    if (!values.message.trim()) next.message = labels.required;
    if (!values.consent) next.consent = labels.required;
    return next;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setStatus('submitting');
    try {
      await onSubmit({ ...values, name: values.name.trim(), email: values.email.trim(), elapsedMs: Date.now() - startedAt.current });
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  const summaryItems = (Object.entries(errors) as Array<[keyof Errors, string]>).map(([id, message]) => ({ id: `contact-${id}`, message }));

  return (
    <section className={cn('grid gap-12 lg:grid-cols-12 lg:gap-x-6', className)} {...props}>
      <div className={cn('flex flex-col gap-8', aside ? 'lg:col-span-7' : 'lg:col-span-8')}>
        <div className="flex flex-col gap-3">
          <h2 className="text-h2 font-bold text-text-heading">{title}</h2>
          {description ? <p className="text-body-lg text-text-body">{description}</p> : null}
        </div>
        {status === 'sent' ? (
          <p role="status" className="rounded-cta bg-emerald-50 p-6 text-body-lg font-bold text-text-link">
            {labels.success}
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <FormErrorSummary title={labels.summaryTitle} errors={summaryItems} />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="contact-name" label={labels.name} required error={errors.name}>
                <TextInput autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field id="contact-mobile" label={labels.mobile} required error={errors.mobile}>
                <TextInput type="tel" autoComplete="tel" dir="ltr" value={values.mobile} onChange={(e) => set('mobile', e.target.value)} />
              </Field>
            </div>
            <Field id="contact-email" label={labels.email} required error={errors.email}>
              <TextInput type="email" autoComplete="email" dir="ltr" value={values.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field id="contact-service" label={labels.service}>
              <Select value={values.service} onChange={(e) => set('service', e.target.value)}>
                <option value="">{labels.servicePlaceholder}</option>
                {services.map((service) => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="contact-message" label={labels.message} required error={errors.message}>
              <Textarea value={values.message} onChange={(e) => set('message', e.target.value)} />
            </Field>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={values.website} onChange={(e) => set('website', e.target.value)} className="absolute h-0 w-0 overflow-hidden opacity-0" />
            <Checkbox id="contact-consent" label={labels.consent} checked={values.consent} error={errors.consent} onChange={(e) => set('consent', e.target.checked)} />
            {status === 'failed' ? (
              <p role="alert" className="text-body-sm text-status-error">
                {labels.failure}
              </p>
            ) : null}
            <Button type="submit" loading={status === 'submitting'} className="self-start">
              {labels.submit}
            </Button>
          </form>
        )}
      </div>
      {aside ? <aside className="flex flex-col gap-6 lg:col-span-5">{aside}</aside> : null}
    </section>
  );
}
