import { z } from 'zod';
import { ActionRefSchema, LinkRefSchema, MultiLanguageFieldSchema } from './common.schema';

export const NavItemSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
        label: z.string(),
        href: z.string(),
        active: z.boolean().optional(),
        children: z.array(NavItemSchema).optional(),
    })
);

export const SocialLinkSchema = z.object({
    network: z.enum(['linkedin', 'x', 'instagram', 'whatsapp']),
    href: z.string(),
    label: z.string(),
});

export const ContactChannelSchema = z.object({
    type: z.enum(['phone', 'email', 'whatsapp', 'hours']),
    label: z.string(),
    value: z.string(),
    href: z.string().optional(),
});

export const FooterColumnSchema = z.object({
    title: z.string(),
    links: z.array(LinkRefSchema),
});

export const SiteChromeWebSchema = z.object({
    logo: z.object({
        href: z.string().default('/'),
        label: z.string(),
    }),
    utility: z.object({
        license: z.string(),
        network: z.string(),
        city: z.string(),
        phone: ContactChannelSchema,
    }),
    nav: z.array(NavItemSchema),
    cta: ActionRefSchema,
    localeSwitch: z
        .object({
            current: z.enum(['ar', 'en']),
            label: z.string(),
            href: z.string(),
        })
        .optional(),
    footer: z.object({
        description: z.string(),
        socials: z.array(SocialLinkSchema),
        columns: z.array(FooterColumnSchema),
        contacts: z.array(ContactChannelSchema),
        legal: z.object({
            copyright: z.string(),
            registry: z.array(z.string()),
            links: z.array(LinkRefSchema),
        }),
        backToTopLabel: z.string().optional(),
        wordmark: z.string().optional(),
    }),
});

export const SiteChromeSectionSchema = z.object({
    utility: z.object({
        license: MultiLanguageFieldSchema,
        network: MultiLanguageFieldSchema,
        city: MultiLanguageFieldSchema,
        phone: z.object({
            label: MultiLanguageFieldSchema,
            value: z.string(),
            href: z.string().optional(),
        }),
    }),
    nav: z.array(
        z.object({
            label: MultiLanguageFieldSchema,
            href: z.string(),
        })
    ),
    headerCta: z.object({
        label: MultiLanguageFieldSchema,
        href: z.string(),
        variant: z.enum(['primary', 'secondary', 'outline-light', 'link']).optional(),
    }),
    footer: z.object({
        description: MultiLanguageFieldSchema,
        wordmark: MultiLanguageFieldSchema.optional(),
        copyright: MultiLanguageFieldSchema,
        registry: z.array(z.string()),
        socials: z.array(
            z.object({
                network: z.enum(['linkedin', 'x', 'instagram', 'whatsapp']),
                href: z.string(),
                label: MultiLanguageFieldSchema,
            })
        ),
        contacts: z.array(
            z.object({
                type: z.enum(['phone', 'email', 'whatsapp', 'hours']),
                label: MultiLanguageFieldSchema,
                value: z.string(),
                href: z.string().optional(),
            })
        ),
    }),
});
