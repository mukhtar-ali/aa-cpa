import {
    ClientLogoAdmin,
    ClientLogoWeb,
    CredentialAdmin,
    CredentialWeb,
    FaqItemAdmin,
    FaqItemWeb,
    OfficeAdmin,
    OfficeWeb,
    TestimonialAdmin,
    TestimonialWeb,
} from '@repo/shared';

function resolveField(val: any, lang: string): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[lang] || val.ar || val.en || '';
}

export class ReferenceMapper {
    // ---------------- Offices ----------------
    static officeToWeb(office: any, lang: string): OfficeWeb {
        let coords: any = undefined;
        if (office.mapX != null && office.mapY != null) {
            coords = { x: office.mapX, y: office.mapY };
        }

        let imgRef: any = undefined;
        if (office.image) {
            imgRef = {
                src: office.image.url || office.image.src || '',
                alt: resolveField(office.image.alt, lang) || resolveField(office.city, lang),
                width: office.image.width || 600,
                height: office.image.height || 400,
            };
        }

        return {
            id: office.id,
            city: resolveField(office.city, lang),
            address: resolveField(office.address, lang),
            mapHref: office.mapUrl || undefined,
            coordinates: coords,
            image: imgRef,
            isHeadquarters: office.isHeadquarters ?? false,
        };
    }

    static officeToAdmin(office: any): OfficeAdmin {
        return {
            id: office.id,
            city: office.city || { ar: '', en: '' },
            address: office.address || { ar: '', en: '' },
            mapUrl: office.mapUrl || null,
            mapX: office.mapX || null,
            mapY: office.mapY || null,
            image: office.image || null,
            isHeadquarters: office.isHeadquarters ?? false,
            order: office.order ?? 0,
            isPublished: office.isPublished ?? true,
            createdAt: office.createdAt,
            updatedAt: office.updatedAt,
        };
    }

    // ---------------- Testimonials ----------------
    static testimonialToWeb(item: any, lang: string): TestimonialWeb {
        let avatarRef: any = undefined;
        if (item.avatar || item.authorAvatar) {
            const av = item.avatar || item.authorAvatar;
            avatarRef = {
                src: av.url || av.src || '',
                alt: resolveField(av.alt, lang) || resolveField(item.name || item.authorName, lang),
            };
        }

        return {
            id: item.id,
            quote: resolveField(item.quote, lang),
            rating: item.rating || 5,
            name: resolveField(item.name || item.authorName, lang),
            role: resolveField(item.role || item.authorRole, lang),
            company: resolveField(item.company, lang) || undefined,
            avatar: avatarRef,
            placement: Array.isArray(item.placement) ? item.placement : [],
        };
    }

    static testimonialToAdmin(item: any): TestimonialAdmin {
        return {
            id: item.id,
            quote: item.quote || { ar: '', en: '' },
            rating: item.rating || 5,
            name: item.name || item.authorName || { ar: '', en: '' },
            role: item.role || item.authorRole || { ar: '', en: '' },
            company: item.company || null,
            avatar: item.avatar || item.authorAvatar || null,
            order: item.order ?? 0,
            isPublished: item.isPublished ?? true,
            placement: Array.isArray(item.placement) ? item.placement : [],
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }

    // ---------------- Client Logos ----------------
    static clientLogoToWeb(logo: any): ClientLogoWeb {
        const img = logo.logo || logo.image;
        const imgRef = {
            src: img?.url || img?.src || (typeof img === 'string' ? img : ''),
            alt: logo.name || '',
            width: img?.width || 200,
            height: img?.height || 80,
        };

        return {
            id: logo.id,
            name: logo.name,
            image: imgRef,
            href: logo.url || undefined,
            row: logo.row ?? 1,
        };
    }

    static clientLogoToAdmin(logo: any): ClientLogoAdmin {
        return {
            id: logo.id,
            name: logo.name,
            logo: logo.logo || logo.image,
            url: logo.url || null,
            row: logo.row ?? 1,
            order: logo.order ?? 0,
            isPublished: logo.isPublished ?? true,
            createdAt: logo.createdAt,
            updatedAt: logo.updatedAt,
        };
    }

    // ---------------- Credentials ----------------
    static credentialToWeb(cred: any, lang: string): CredentialWeb {
        const img = cred.logo || cred.badge || cred.image;
        const imgRef = {
            src: img?.url || img?.src || (typeof img === 'string' ? img : ''),
            alt: resolveField(cred.name || cred.title, lang),
            width: img?.width || 160,
            height: img?.height || 60,
        };

        return {
            id: cred.id,
            name: resolveField(cred.name || cred.title, lang),
            image: imgRef,
            href: cred.url || undefined,
        };
    }

    static credentialToAdmin(cred: any): CredentialAdmin {
        return {
            id: cred.id,
            name: cred.name || cred.title || { ar: '', en: '' },
            logo: cred.logo || cred.badge || cred.image,
            url: cred.url || null,
            order: cred.order ?? 0,
            isPublished: cred.isPublished ?? true,
            createdAt: cred.createdAt,
            updatedAt: cred.updatedAt,
        };
    }

    // ---------------- FAQs ----------------
    static faqToWeb(faq: any, lang: string): FaqItemWeb {
        return {
            id: faq.id,
            question: resolveField(faq.question, lang),
            answer: resolveField(faq.answer, lang),
            scope: faq.scope || 'global',
            serviceId: faq.serviceId || undefined,
        };
    }

    static faqToAdmin(faq: any): FaqItemAdmin {
        return {
            id: faq.id,
            question: faq.question || { ar: '', en: '' },
            answer: faq.answer || { ar: '', en: '' },
            scope: faq.scope || 'global',
            serviceId: faq.serviceId || null,
            order: faq.order ?? 0,
            isPublished: faq.isPublished ?? true,
            service: faq.service
                ? {
                      id: faq.service.id,
                      title: faq.service.translations?.reduce((acc: any, tr: any) => {
                          acc[tr.language] = tr.title;
                          return acc;
                      }, {}) || { ar: '', en: '' },
                  }
                : null,
            createdAt: faq.createdAt,
            updatedAt: faq.updatedAt,
        };
    }
}
