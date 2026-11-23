'use client';

import { usePathname } from 'next/navigation';
import { ContactFormLayout, type ContactFormValues } from '@repo/design-system/sections';
import { submitContact } from '@/src/actions/contact';
import { track } from '@/src/lib/analytics';
import type { Labels, Lang } from '@/src/lib/i18n/dictionaries';

interface Props {
    lang: Lang;
    labels: Labels['contactForm'];
    title: string;
    description?: string;
    services: { value: string; label: string }[];
    defaultService?: string;
    successMessage: string;
    aside?: React.ReactNode;
}

/** Binds the design-system contact form to the `submitContact` Server Action and fires `lead_submitted` on success. */
export function ContactForm({ lang, labels, title, description, services, defaultService, successMessage, aside }: Props) {
    const pathname = usePathname();
    const onSubmit = async (values: ContactFormValues) => {
        const result = await submitContact(lang, {
            name: values.name,
            mobile: values.mobile,
            email: values.email,
            service: values.service,
            message: values.message,
            consent: values.consent,
            website: values.website,
            startedAt: values.startedAt,
            landingPath: pathname,
        });
        // The layout turns a thrown error into its failure message; the rate-limit text is the one case worth saying differently.
        if (!result.ok) throw new Error(result.error === 'rateLimited' ? labels.rateLimited : labels.failure);
        track('lead_submitted', { source: 'contact', ...(values.service ? { service_id: values.service } : {}), lang });
    };

    return (
        <ContactFormLayout
            id="contact-form"
            title={title}
            description={description}
            services={services}
            defaultService={defaultService}
            aside={aside}
            onSubmit={onSubmit}
            labels={{
                name: labels.name,
                mobile: labels.mobile,
                email: labels.email,
                service: labels.service,
                servicePlaceholder: labels.servicePlaceholder,
                message: labels.message,
                consent: (
                    <>
                        {labels.consentPrefix} <a href={`/${lang}/privacy`} className="underline">{labels.consentLink}</a>
                    </>
                ),
                submit: labels.submit,
                required: labels.required,
                invalidMobile: labels.invalidMobile,
                invalidEmail: labels.invalidEmail,
                summaryTitle: labels.summaryTitle,
                success: successMessage,
                failure: labels.failure,
            }}
        />
    );
}
