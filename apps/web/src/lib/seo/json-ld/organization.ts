import type { Lang } from '@/src/lib/i18n/dictionaries';
import { siteUrl } from '@/src/lib/seo/page-metadata';

export interface OfficeJsonLdInput {
    city: string;
    address?: string | null;
    telephone?: string | null;
    openingHoursSpecification?: string | null;
    isHeadquarters?: boolean;
    coordinates?: { x: number; y: number } | null;
}

export interface OrganizationJsonLdInput {
    lang: Lang;
    name?: string | null;
    logo?: string | null;
    telephone?: string | null;
    openingHoursSpecification?: string | null;
    sameAs?: string[] | null;
    offices?: OfficeJsonLdInput[] | null;
}

/**
 * Builds schema.org AccountingService + Organization structured data.
 * Per research R1: SOCPA licence 522 via hasCredential, memberOf 3E Accounting,
 * logo, offices with PostalAddress, telephone, openingHoursSpecification, sameAs.
 */
export function buildOrganizationJsonLd({
    lang,
    name,
    logo,
    telephone,
    openingHoursSpecification,
    sameAs,
    offices,
}: OrganizationJsonLdInput) {
    const base = siteUrl();
    const defaultName = lang === 'ar'
        ? 'شركة عبدالرحمن الشبيشيري للاستشارات المهنية'
        : 'Abdulrahman Al-Shubaishiri Professional Consulting';
    const orgName = name || defaultName;

    const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': ['AccountingService', 'Organization'],
        '@id': `${base}/#organization`,
        name: orgName,
        url: `${base}/${lang}`,
        inLanguage: lang,
        hasCredential: {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'license',
            name: lang === 'ar' ? 'ترخيص الهيئة السعودية للمراجعين والمحاسبين رقم 522' : 'SOCPA License No. 522',
            recognizedBy: {
                '@type': 'Organization',
                name: lang === 'ar' ? 'الهيئة السعودية للمراجعين والمحاسبين' : 'Saudi Organization for Chartered and Professional Accountants (SOCPA)',
                url: 'https://socpa.org.sa',
            },
        },
        memberOf: {
            '@type': 'Organization',
            name: '3E Accounting Network',
            url: 'https://www.3ecpa.com',
        },
    };

    if (logo) jsonLd.logo = logo;
    if (telephone) jsonLd.telephone = telephone;
    if (openingHoursSpecification) jsonLd.openingHoursSpecification = openingHoursSpecification;
    if (sameAs && sameAs.length > 0) jsonLd.sameAs = sameAs;

    if (offices && offices.length > 0) {
        jsonLd.department = offices.map((office) => {
            const dept: Record<string, unknown> = {
                '@type': 'AccountingService',
                name: `${orgName} - ${office.city}`,
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: office.city,
                    ...(office.address ? { streetAddress: office.address } : {}),
                    addressCountry: 'SA',
                },
            };
            const phone = office.telephone || telephone;
            if (phone) dept.telephone = phone;
            const hours = office.openingHoursSpecification || openingHoursSpecification;
            if (hours) dept.openingHoursSpecification = hours;
            if (office.coordinates) {
                dept.geo = {
                    '@type': 'GeoCoordinates',
                    latitude: office.coordinates.x,
                    longitude: office.coordinates.y,
                };
            }
            return dept;
        });
    }

    return jsonLd;
}
