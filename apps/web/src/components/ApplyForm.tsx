'use client';

import { ApplicationFormLayout } from '@repo/design-system/sections';
import { track } from '@/src/lib/analytics';
import type { Labels, Lang } from '@/src/lib/i18n/dictionaries';

type Values = Parameters<React.ComponentProps<typeof ApplicationFormLayout>['onSubmit']>[0];

interface Props {
    lang: Lang;
    slug: string;
    department: string;
    labels: Labels['careers'];
    formLabels: Labels['contactForm'];
    aside?: React.ReactNode;
}

/** POST the multipart form by XHR to `/api/apply-upload` (research R4: the only reason is upload progress events). */
function upload(url: string, body: FormData, onProgress: (percent: number) => void): Promise<number> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
        xhr.onload = () => resolve(xhr.status);
        xhr.onerror = () => reject(new Error('network'));
        xhr.ontimeout = () => reject(new Error('timeout'));
        xhr.send(body);
    });
}

/** Binds the design-system application form to the upload route and fires `job_applied` on success. */
export function ApplyForm({ lang, slug, department, labels, formLabels, aside }: Props) {
    const onSubmit = async (v: Values) => {
        const body = new FormData();
        body.set('fullName', v.name);
        body.set('email', v.email);
        body.set('mobile', v.mobile);
        body.set('motivation', v.coverLetter);
        body.set('consent', String(v.consent));
        body.set('website', v.website);
        body.set('startedAt', String(v.startedAt));
        body.set('resume', v.cv);
        const status = await upload(`/api/apply-upload?slug=${encodeURIComponent(slug)}&lang=${lang}`, body, () => {});
        if (status !== 201) throw new Error(`apply failed ${status}`);
        track('job_applied', { department, lang });
    };

    return (
        <ApplicationFormLayout
            id="apply"
            title={labels.applyTitle}
            aside={aside}
            onSubmit={onSubmit}
            uploadMessages={{
                prompt: labels.promptUpload,
                promptAction: labels.promptAction,
                hint: labels.hint,
                uploaded: (file) => `${Math.max(1, Math.round(file.size / 1024))} KB · ${labels.uploaded}`,
                remove: labels.remove,
                tooLarge: () => labels.tooLarge,
                wrongType: () => labels.wrongType,
            }}
            labels={{
                name: formLabels.name,
                mobile: formLabels.mobile,
                email: formLabels.email,
                coverLetter: labels.coverLetter,
                cv: labels.cv,
                consent: (
                    <>
                        {formLabels.consentPrefix} <a href={`/${lang}/privacy`} className="underline">{formLabels.consentLink}</a>
                    </>
                ),
                submit: formLabels.submit,
                required: formLabels.required,
                invalidMobile: formLabels.invalidMobile,
                invalidEmail: formLabels.invalidEmail,
                summaryTitle: formLabels.summaryTitle,
                success: labels.success,
                failure: formLabels.failure,
            }}
        />
    );
}
