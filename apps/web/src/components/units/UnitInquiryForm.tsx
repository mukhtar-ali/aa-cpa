'use client';

import { useState } from 'react';
import { endpoint } from '@repo/shared';
import { toast } from 'react-toastify';
import { useT, useIsRtl } from '@/dictionaries/client';
import { useMutation } from '@/src/hooks/useMutation';
import { apiErrorMessage } from '@/src/utilities/apiError';

const inputClass =
    'field';

const EMPTY = { fullName: '', phone: '', email: '', preferredDate: '', message: '' };

/** Sends a unit inquiry to the public POST /api/inquiry endpoint (linked to the unit and its project). */
export function UnitInquiryForm({ unitId, projectId }: { unitId: string; projectId?: string }) {
    const t = useT();
    const isRtl = useIsRtl();
    const [form, setForm] = useState(EMPTY);

    const { mutate, isLoading } = useMutation({
        endpoint: endpoint.inquiry.create,
        method: 'POST',
        onSuccess: () => {
            toast.success(t.units.inquirySent);
            setForm(EMPTY);
        },
        onError: (error) => toast.error(apiErrorMessage(error)),
    });

    const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    return (
        <form
            dir={isRtl ? 'rtl' : 'ltr'}
            onSubmit={(e) => {
                e.preventDefault();
                // Empty optional fields are dropped so the API schema (optional, not empty-string) accepts them.
                const payload: Record<string, string> = { unitId, fullName: form.fullName, phone: form.phone, email: form.email };
                if (projectId) payload.projectId = projectId;
                if (form.preferredDate) payload.preferredDate = form.preferredDate;
                if (form.message.trim()) payload.message = form.message.trim();
                mutate(payload);
            }}
            className="grid gap-4 sm:grid-cols-2"
        >
            <div>
                <label className="label">{t.fields.fullName}</label>
                <input required className={inputClass} value={form.fullName} onChange={set('fullName')} />
            </div>
            <div>
                <label className="label">{t.fields.phone}</label>
                <input
                    required
                    type="tel"
                    inputMode="numeric"
                    // The API accepts digits only (country code included, no "+").
                    pattern="[0-9]{6,}"
                    title={t.units.phoneHint}
                    className={inputClass}
                    value={form.phone}
                    onChange={set('phone')}
                />
            </div>
            <div>
                <label className="label">{t.fields.email}</label>
                <input required type="email" className={inputClass} value={form.email} onChange={set('email')} />
            </div>
            <div>
                <label className="label">{t.units.preferredDate}</label>
                <input type="date" className={inputClass} value={form.preferredDate} onChange={set('preferredDate')} />
            </div>
            <div className="sm:col-span-2">
                <label className="label">{t.fields.message}</label>
                <textarea rows={4} className={inputClass} value={form.message} onChange={set('message')} />
            </div>
            <div className="sm:col-span-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                >
                    {isLoading ? '...' : t.units.inquireSend}
                </button>
            </div>
        </form>
    );
}
