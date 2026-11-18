'use client';

import { useState } from 'react';
import { endpoint } from '@repo/shared';
import { toast } from 'react-toastify';
import { useT, useIsRtl } from '@/dictionaries/client';
import { useMutation } from '@/src/hooks/useMutation';
import { apiErrorMessage } from '@/src/utilities/apiError';

// Mirrors the API limit in apps/api/src/careers/careers.controller.ts
export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

export function validateResume(file: Pick<File, 'type' | 'name' | 'size'>): 'ok' | 'not_pdf' | 'too_large' {
    const isPdf = file.type === 'application/pdf' || (file.type === '' && file.name.toLowerCase().endsWith('.pdf'));
    if (!isPdf) {
        return 'not_pdf';
    }
    if (file.size > MAX_RESUME_SIZE_BYTES) {
        return 'too_large';
    }
    return 'ok';
}

interface JobApplyFormProps {
    jobId: string;
}

export function JobApplyForm({ jobId }: JobApplyFormProps) {
    const t = useT();
    const isRtl = useIsRtl();
    const [fields, setFields] = useState({ firstName: '', lastName: '', email: '', phone: '', coverLetter: '' });
    const [resume, setResume] = useState<File | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const { mutate, isLoading } = useMutation({
        endpoint: endpoint.job.apply,
        method: 'POST',
        onError: (error) => toast.error(apiErrorMessage(error)),
        onSuccess: () => {
            toast.success(t.contact.messageSent);
            setSubmitted(true);
        },
    });

    if (submitted) {
        return <p className="card p-6 text-center text-muted">{t.contact.messageSent}</p>;
    }

    const inputClass =
        'field';

    return (
        <form
            dir={isRtl ? 'rtl' : 'ltr'}
            onSubmit={(e) => {
                e.preventDefault();
                if (!resume) {
                    toast.error(t.upload_resume);
                    return;
                }
                const validation = validateResume(resume);
                if (validation !== 'ok') {
                    toast.error(validation === 'not_pdf' ? t.resume_must_be_pdf : t.resume_too_large);
                    return;
                }
                const formData = new FormData();
                formData.append('jobId', jobId);
                formData.append('firstName', fields.firstName);
                formData.append('lastName', fields.lastName);
                formData.append('email', fields.email);
                if (fields.phone) formData.append('phone', fields.phone);
                if (fields.coverLetter) formData.append('coverLetter', fields.coverLetter);
                formData.append('resume', resume);
                mutate(formData);
            }}
            className="grid gap-4 sm:grid-cols-2"
        >
            <h2 className="text-xl font-semibold sm:col-span-2">{t.apply_title}</h2>
            <div>
                <label className="label">{t.full_name}</label>
                <input
                    required
                    className={inputClass}
                    value={fields.firstName}
                    placeholder="First name"
                    onChange={(e) => setFields((f) => ({ ...f, firstName: e.target.value }))}
                />
            </div>
            <div>
                <label className="label">&nbsp;</label>
                <input
                    required
                    className={inputClass}
                    value={fields.lastName}
                    placeholder="Last name"
                    onChange={(e) => setFields((f) => ({ ...f, lastName: e.target.value }))}
                />
            </div>
            <div>
                <label className="label">{t.email_address}</label>
                <input
                    required
                    type="email"
                    className={inputClass}
                    value={fields.email}
                    onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
                />
            </div>
            <div>
                <label className="label">{t.phone_number}</label>
                <input
                    className={inputClass}
                    value={fields.phone}
                    onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value }))}
                />
            </div>
            <div className="sm:col-span-2">
                <label className="label">{t.your_message}</label>
                <textarea
                    rows={4}
                    className={inputClass}
                    value={fields.coverLetter}
                    onChange={(e) => setFields((f) => ({ ...f, coverLetter: e.target.value }))}
                />
            </div>
            <div className="sm:col-span-2">
                <label className="label">{t.upload_resume} (PDF)</label>
                <input
                    required
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (!file) {
                            setResume(null);
                            return;
                        }
                        const validation = validateResume(file);
                        if (validation !== 'ok') {
                            toast.error(validation === 'not_pdf' ? t.resume_must_be_pdf : t.resume_too_large);
                            e.target.value = '';
                            setResume(null);
                            return;
                        }
                        setResume(file);
                    }}
                    className="block w-full text-sm"
                />
            </div>
            <div className="sm:col-span-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                >
                    {isLoading ? '...' : t.submit}
                </button>
            </div>
        </form>
    );
}
