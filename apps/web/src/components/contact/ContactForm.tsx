'use client';

import { useState } from 'react';
import { endpoint } from '@repo/shared';
import { toast } from 'react-toastify';
import { useT, useIsRtl } from '@/dictionaries/client';
import { useMutation } from '@/src/hooks/useMutation';
import { apiErrorMessage } from '@/src/utilities/apiError';

const DEPARTMENTS = ['Sales', 'Customer Service', 'Careers', 'General Inquiry'];

export function ContactForm() {
    const t = useT();
    const isRtl = useIsRtl();
    const [form, setForm] = useState({
        fullName: '',
        subject: '',
        email: '',
        department: DEPARTMENTS[0],
        message: '',
    });

    const { mutate, isLoading } = useMutation({
        endpoint: endpoint.contact.create,
        method: 'POST',
        onError: (error) => toast.error(apiErrorMessage(error)),
        onSuccess: () => {
            toast.success(t.contact.messageSent);
            setForm({ fullName: '', subject: '', email: '', department: DEPARTMENTS[0], message: '' });
        },
    });

    const inputClass =
        'field';

    return (
        <form
            dir={isRtl ? 'rtl' : 'ltr'}
            onSubmit={(e) => {
                e.preventDefault();
                mutate(form);
            }}
            className="grid gap-4 sm:grid-cols-2"
        >
            <div className="sm:col-span-1">
                <label className="label">{t.fields.fullName}</label>
                <input
                    required
                    className={inputClass}
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
            </div>
            <div className="sm:col-span-1">
                <label className="label">{t.fields.email}</label>
                <input
                    required
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
            </div>
            <div className="sm:col-span-1">
                <label className="label">{t.fields.subject}</label>
                <input
                    required
                    className={inputClass}
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                />
            </div>
            <div className="sm:col-span-1">
                <label className="label">{t.fields.department}</label>
                <select
                    className={inputClass}
                    value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                >
                    {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
            </div>
            <div className="sm:col-span-2">
                <label className="label">{t.fields.message}</label>
                <textarea
                    required
                    rows={5}
                    className={inputClass}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
            </div>
            <div className="sm:col-span-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                >
                    {isLoading ? '...' : t.contact.sendMessage}
                </button>
            </div>
        </form>
    );
}
