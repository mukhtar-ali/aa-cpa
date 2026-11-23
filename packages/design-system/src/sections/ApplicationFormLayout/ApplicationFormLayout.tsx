'use client';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { isEmail, isSaudiMobile } from '../../lib/validators';
import { withTimeout } from '../../lib/with-timeout';
import { Checkbox } from '../../forms/Checkbox';
import { Field } from '../../forms/Field';
import { FileUpload } from '../../forms/FileUpload';
import type { FileUploadMessages } from '../../forms/FileUpload';
import { FormErrorSummary } from '../../forms/FormErrorSummary';
import { TextInput } from '../../forms/TextInput';
import { Textarea } from '../../forms/Textarea';
import { Button } from '../../primitives/Button';

export interface ApplicationValues {
  name: string;
  mobile: string;
  email: string;
  coverLetter: string;
  cv: File;
  consent: boolean;
  website: string;
  /** Epoch milliseconds when the form was shown: the API's public-form guard (`startedAt`) rejects submissions faster than 3 seconds. */
  startedAt: number;
}

export interface ApplicationFormLabels {
  name: string;
  mobile: string;
  email: string;
  coverLetter: string;
  cv: string;
  consent: React.ReactNode;
  submit: string;
  required: string;
  invalidMobile: string;
  invalidEmail: string;
  summaryTitle: string;
  success: string;
  failure: string;
}

export interface ApplicationFormLayoutProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'onSubmit'> {
  title: string;
  labels: ApplicationFormLabels;
  uploadMessages: FileUploadMessages;
  onSubmit: (values: ApplicationValues) => Promise<void>;
  /** Job summary card shown at the inline end from `lg`. */
  aside?: React.ReactNode;
  /** Give up on `onSubmit` after this many milliseconds (default 30 000) and show the failure message. */
  submitTimeoutMs?: number;
  maxCvBytes?: number;
}

type Errors = Partial<Record<'name' | 'mobile' | 'email' | 'cv' | 'consent', string>>;

/**
 * Job application form: contact fields, CV upload (PDF or Word, 5 MB), optional cover letter and consent, with the same validation, error
 * summary, honeypot and timing signal as the contact form. The application frame (514:3194) was not read, so spacing is inferred (to verify).
 *
 * @figma 514:3194 (unverified)
 */
export function ApplicationFormLayout({ title, labels, uploadMessages, onSubmit, aside, submitTimeoutMs = 30_000, maxCvBytes, className, ...props }: ApplicationFormLayoutProps) {
  const startedAt = React.useRef(Date.now());
  const [values, setValues] = React.useState({ name: '', mobile: '', email: '', coverLetter: '', consent: false, website: '' });
  const [cv, setCv] = React.useState<File | null>(null);
  const [errors, setErrors] = React.useState<Errors>({});
  const [attempt, setAttempt] = React.useState(0);
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'sent' | 'failed'>('idle');
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((v) => ({ ...v, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!values.name.trim()) next.name = labels.required;
    if (!values.mobile.trim()) next.mobile = labels.required;
    else if (!isSaudiMobile(values.mobile)) next.mobile = labels.invalidMobile;
    if (!values.email.trim()) next.email = labels.required;
    else if (!isEmail(values.email)) next.email = labels.invalidEmail;
    if (!cv) next.cv = labels.required;
    if (!values.consent) next.consent = labels.required;
    setErrors(next);
    if (Object.keys(next).length > 0) setAttempt((n) => n + 1);
    if (Object.keys(next).length > 0 || !cv) return;
    setStatus('submitting');
    try {
      await withTimeout(onSubmit({ ...values, name: values.name.trim(), email: values.email.trim(), cv, startedAt: startedAt.current }), submitTimeoutMs);
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  const summaryItems = (Object.entries(errors) as Array<[keyof Errors, string]>).map(([id, message]) => ({ id: `application-${id}`, message }));

  return (
    <section className={cn('grid gap-12 lg:grid-cols-12 lg:gap-x-6', className)} {...props}>
      <div className={cn('flex flex-col gap-8', aside ? 'lg:col-span-7' : 'lg:col-span-8')}>
        <h2 className="text-h2 font-bold text-text-heading">{title}</h2>
        {status === 'sent' ? (
          <p role="status" tabIndex={-1} ref={(el) => el?.focus()} className="rounded-cta bg-emerald-50 p-6 text-body-lg font-bold text-text-link outline-none">
            {labels.success}
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <FormErrorSummary title={labels.summaryTitle} errors={summaryItems} focusKey={attempt} />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="application-name" label={labels.name} required announce={false} error={errors.name}>
                <TextInput autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field id="application-mobile" label={labels.mobile} required announce={false} error={errors.mobile}>
                <TextInput type="tel" autoComplete="tel" dir="ltr" value={values.mobile} onChange={(e) => set('mobile', e.target.value)} />
              </Field>
            </div>
            <Field id="application-email" label={labels.email} required announce={false} error={errors.email}>
              <TextInput type="email" autoComplete="email" dir="ltr" value={values.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <FileUpload
              id="application-cv"
              label={labels.cv}
              file={cv}
              onFileChange={(file) => {
                setCv(file);
                if (file) setErrors((e) => ({ ...e, cv: undefined }));
              }}
              // Extensions too: Windows browsers often report an empty MIME type for .doc and .docx.
              accept={['.pdf', '.doc', '.docx', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
              maxSizeBytes={maxCvBytes}
              messages={uploadMessages}
              error={errors.cv}
            />
            <Field id="application-cover" label={labels.coverLetter}>
              <Textarea value={values.coverLetter} onChange={(e) => set('coverLetter', e.target.value)} />
            </Field>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" data-1p-ignore data-lpignore="true" data-form-type="other" aria-hidden="true" value={values.website} onChange={(e) => set('website', e.target.value)} className="absolute h-0 w-0 overflow-hidden opacity-0" />
            <Checkbox id="application-consent" label={labels.consent} checked={values.consent} error={errors.consent} onChange={(e) => set('consent', e.target.checked)} />
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
      {aside ? <aside className="lg:col-span-5">{aside}</aside> : null}
    </section>
  );
}
