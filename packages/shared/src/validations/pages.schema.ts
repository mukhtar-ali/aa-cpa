import { z } from 'zod';
import {
    ActionRefSchema,
    ImageFieldSchema,
    ImageRefSchema,
    LinkRefSchema,
    MultiLanguageFieldSchema,
} from './common.schema';

// --- Shared primitive web schemas ---

export const StatWebSchema = z.object({
    value: z.union([z.number(), z.string()]),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    label: z.string(),
});

export const PillarWebSchema = z.object({
    icon: z.string(),
    title: z.string(),
    body: z.string(),
});

export const ProcessStepWebSchema = z.object({
    index: z.number().optional(),
    title: z.string(),
    body: z.string(),
});

// --- Page Hero Schemas ---

export const PageHeroWebSchema = z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    image: ImageRefSchema,
    breadcrumbs: z.array(LinkRefSchema).optional(),
    action: ActionRefSchema.optional(),
});

// --- Home Page ---

export const HomePageWebSchema = z.object({
    hero: z.object({
        title: z.string(),
        accent: z.string().optional(),
        body: z.string(),
        actions: z.array(ActionRefSchema),
        image: ImageRefSchema,
    }),
    gap: z.object({
        statement: z.string(),
        eyebrow: z.string(),
        body: z.string(),
        images: z.array(ImageRefSchema).optional(),
    }),
    services: z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            accent: z.string().optional(),
            intro: z.string(),
            ctaLabel: z.string(),
            items: z.array(z.any()).optional(),
        })
        .or(z.array(z.any())),
    reasons: z.object({
        title: z.string(),
        description: z.string(),
        action: ActionRefSchema.optional(),
        pillars: z.array(PillarWebSchema),
        image: ImageRefSchema.optional(),
        stats: z.array(StatWebSchema),
    }),
    credentials: z.object({
        title: z.string(),
        description: z.string().optional(),
        logos: z.array(z.any()).optional(),
    }),
    process: z.object({
        eyebrow: z.string(),
        title: z.string(),
        accent: z.string().optional(),
        description: z.string(),
        steps: z.array(ProcessStepWebSchema),
    }),
    partnerQuote: z.object({
        title: z.string(),
        body: z.string(),
        action: ActionRefSchema.optional(),
        image: ImageRefSchema.optional(),
    }),
    newsBlock: z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            action: ActionRefSchema.optional(),
        })
        .optional(),
    news: z.array(z.any()).optional(),
    estimatorBlock: z
        .object({
            title: z.string(),
            body: z.string(),
        })
        .optional(),
    testimonials: z.array(z.any()).optional(),
});

export const HomePageSectionSchema = z.object({
    hero: z.object({
        title: MultiLanguageFieldSchema,
        accent: MultiLanguageFieldSchema.optional(),
        body: MultiLanguageFieldSchema,
        actions: z.array(ActionRefSchema),
        image: ImageFieldSchema.optional(),
    }),
    gap: z.object({
        statement: MultiLanguageFieldSchema,
        eyebrow: MultiLanguageFieldSchema,
        body: MultiLanguageFieldSchema,
        images: z.array(ImageFieldSchema).optional(),
    }),
    services: z.object({
        eyebrow: MultiLanguageFieldSchema,
        title: MultiLanguageFieldSchema,
        accent: MultiLanguageFieldSchema.optional(),
        intro: MultiLanguageFieldSchema,
        ctaLabel: MultiLanguageFieldSchema,
    }),
    reasons: z.object({
        title: MultiLanguageFieldSchema,
        description: MultiLanguageFieldSchema,
        action: ActionRefSchema.optional(),
        pillars: z.array(
            z.object({
                icon: z.string(),
                title: MultiLanguageFieldSchema,
                body: MultiLanguageFieldSchema,
            })
        ),
        image: ImageFieldSchema.optional(),
        stats: z.array(
            z.object({
                value: z.union([z.number(), z.string()]),
                prefix: z.string().optional(),
                suffix: z.string().optional(),
                label: MultiLanguageFieldSchema,
            })
        ),
    }),
    credentials: z.object({
        title: MultiLanguageFieldSchema,
        description: MultiLanguageFieldSchema.optional(),
    }),
    process: z.object({
        eyebrow: MultiLanguageFieldSchema,
        title: MultiLanguageFieldSchema,
        accent: MultiLanguageFieldSchema.optional(),
        description: MultiLanguageFieldSchema,
        steps: z.array(
            z.object({
                index: z.number().optional(),
                title: MultiLanguageFieldSchema,
                body: MultiLanguageFieldSchema,
            })
        ),
    }),
    partnerQuote: z.object({
        title: MultiLanguageFieldSchema,
        body: MultiLanguageFieldSchema,
        action: ActionRefSchema.optional(),
        image: ImageFieldSchema.optional(),
    }),
    newsBlock: z.object({
        eyebrow: MultiLanguageFieldSchema,
        title: MultiLanguageFieldSchema,
        action: ActionRefSchema.optional(),
    }),
    estimatorBlock: z.object({
        title: MultiLanguageFieldSchema,
        body: MultiLanguageFieldSchema,
    }),
    testimonialSelection: z.array(z.string()).optional(),
});

// --- Services Page ---

export const ServicesPageWebSchema = z.object({
    hero: PageHeroWebSchema,
    statement: z.string(),
    items: z.array(z.any()).optional(),
    partnerQuote: z
        .object({
            title: z.string(),
            body: z.string(),
            action: ActionRefSchema.optional(),
            image: ImageRefSchema.optional(),
        })
        .optional(),
});

export const ServicesPageSectionSchema = z.object({
    hero: z.object({
        title: MultiLanguageFieldSchema,
        subtitle: MultiLanguageFieldSchema.optional(),
        image: ImageFieldSchema.optional(),
    }),
    statement: MultiLanguageFieldSchema,
    partnerQuote: z
        .object({
            title: MultiLanguageFieldSchema,
            body: MultiLanguageFieldSchema,
            action: ActionRefSchema.optional(),
            image: ImageFieldSchema.optional(),
        })
        .optional(),
});

export const ServiceSharedSectionSchema = z.object({
    ctaCards: z.object({
        expert: z.object({
            title: MultiLanguageFieldSchema,
            body: MultiLanguageFieldSchema,
            action: ActionRefSchema,
        }),
        faq: z.object({
            title: MultiLanguageFieldSchema,
            body: MultiLanguageFieldSchema,
            action: ActionRefSchema,
        }),
    }),
    notSureTitle: MultiLanguageFieldSchema,
    faqTitle: MultiLanguageFieldSchema,
});

// --- Sectors Page ---

export const SectorsPageWebSchema = z.object({
    hero: PageHeroWebSchema,
    statement: z.string(),
    indexTitle: z.string(),
    indexDescription: z.string(),
    items: z.array(z.any()).optional(),
    caseStories: z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            action: ActionRefSchema.optional(),
        })
        .optional(),
});

export const SectorsPageSectionSchema = z.object({
    hero: z.object({
        title: MultiLanguageFieldSchema,
        subtitle: MultiLanguageFieldSchema.optional(),
        image: ImageFieldSchema.optional(),
    }),
    statement: MultiLanguageFieldSchema,
    indexTitle: MultiLanguageFieldSchema,
    indexDescription: MultiLanguageFieldSchema,
    caseStories: z.object({
        eyebrow: MultiLanguageFieldSchema,
        title: MultiLanguageFieldSchema,
        action: ActionRefSchema,
    }),
});

// --- Articles Page ---

export const ArticlesPageWebSchema = z.object({
    hero: PageHeroWebSchema,
    featuredTitle: z.string(),
    listEyebrow: z.string(),
    listTitle: z.string(),
    featured: z.any().optional(),
    items: z.array(z.any()).optional(),
});

export const ArticlesPageSectionSchema = z.object({
    hero: z.object({
        title: MultiLanguageFieldSchema,
        subtitle: MultiLanguageFieldSchema.optional(),
        image: ImageFieldSchema.optional(),
    }),
    featuredTitle: MultiLanguageFieldSchema,
    listEyebrow: MultiLanguageFieldSchema,
    listTitle: MultiLanguageFieldSchema,
});

// --- Careers Page ---

export const CareersPageWebSchema = z.object({
    hero: PageHeroWebSchema,
    perks: z.object({
        eyebrow: z.string(),
        title: z.string(),
        items: z.array(
            z.object({
                icon: z.string().optional(),
                title: z.string(),
                body: z.string(),
            })
        ),
    }),
    team: z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            accent: z.string().optional(),
            body: z.string(),
            image: ImageRefSchema.optional(),
            quote: z
                .object({
                    text: z.string(),
                    name: z.string(),
                    role: z.string(),
                    avatar: ImageRefSchema.optional(),
                })
                .optional(),
            stats: z.array(StatWebSchema).optional(),
            photos: z.array(ImageRefSchema).optional(),
        })
        .optional(),
    jobsEyebrow: z.string(),
    jobsTitle: z.string(),
    items: z.array(z.any()).optional(),
    hiringSteps: z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            steps: z.array(
                z.object({
                    title: z.string(),
                    body: z.string(),
                })
            ),
        })
        .optional(),
});

export const CareersPageSectionSchema = z.object({
    hero: z.object({
        title: MultiLanguageFieldSchema,
        subtitle: MultiLanguageFieldSchema.optional(),
        image: ImageFieldSchema.optional(),
    }),
    perks: z.object({
        eyebrow: MultiLanguageFieldSchema,
        title: MultiLanguageFieldSchema,
        items: z.array(
            z.object({
                icon: z.string().optional(),
                title: MultiLanguageFieldSchema,
                body: MultiLanguageFieldSchema,
            })
        ),
    }),
    team: z
        .object({
            eyebrow: MultiLanguageFieldSchema,
            title: MultiLanguageFieldSchema,
            accent: MultiLanguageFieldSchema.optional(),
            body: MultiLanguageFieldSchema,
            image: ImageFieldSchema.optional(),
            quote: z
                .object({
                    text: MultiLanguageFieldSchema,
                    name: MultiLanguageFieldSchema,
                    role: MultiLanguageFieldSchema,
                    avatar: ImageFieldSchema.optional(),
                })
                .optional(),
            stats: z
                .array(
                    z.object({
                        value: z.union([z.number(), z.string()]),
                        label: MultiLanguageFieldSchema,
                    })
                )
                .optional(),
            photos: z.array(ImageFieldSchema).optional(),
        })
        .optional(),
    jobsEyebrow: MultiLanguageFieldSchema,
    jobsTitle: MultiLanguageFieldSchema,
    hiringSteps: z.object({
        eyebrow: MultiLanguageFieldSchema,
        title: MultiLanguageFieldSchema,
        steps: z.array(
            z.object({
                title: MultiLanguageFieldSchema,
                body: MultiLanguageFieldSchema,
            })
        ),
    }),
    application: z
        .object({
            eyebrow: MultiLanguageFieldSchema,
            title: MultiLanguageFieldSchema,
            description: MultiLanguageFieldSchema,
            successTitle: MultiLanguageFieldSchema,
            successBody: MultiLanguageFieldSchema,
            closedTitle: MultiLanguageFieldSchema,
            closedBody: MultiLanguageFieldSchema,
        })
        .optional(),
    jobSidebarQuestionCard: z
        .object({
            title: MultiLanguageFieldSchema,
            body: MultiLanguageFieldSchema,
            action: ActionRefSchema,
        })
        .optional(),
});

// --- Contact Page ---

export const ContactPageWebSchema = z.object({
    hero: PageHeroWebSchema,
    intro: z.object({
        eyebrow: z.string(),
        title: z.string(),
        body: z.string(),
    }),
    form: z.object({
        title: z.string(),
        subtitle: z.string(),
        successTitle: z.string(),
        successBody: z.string(),
    }),
    offices: z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            mapImage: ImageRefSchema.optional(),
            items: z.array(z.any()).optional(),
        })
        .or(z.array(z.any())),
    faq: z
        .object({
            eyebrow: z.string(),
            title: z.string(),
        })
        .optional(),
});

export const ContactPageSectionSchema = z.object({
    hero: z.object({
        title: MultiLanguageFieldSchema,
        subtitle: MultiLanguageFieldSchema.optional(),
        image: ImageFieldSchema.optional(),
    }),
    intro: z.object({
        eyebrow: MultiLanguageFieldSchema,
        title: MultiLanguageFieldSchema,
        body: MultiLanguageFieldSchema,
    }),
    form: z.object({
        title: MultiLanguageFieldSchema,
        subtitle: MultiLanguageFieldSchema,
        successTitle: MultiLanguageFieldSchema,
        successBody: MultiLanguageFieldSchema,
    }),
    offices: z
        .object({
            eyebrow: MultiLanguageFieldSchema,
            title: MultiLanguageFieldSchema,
            mapImage: ImageFieldSchema.optional(),
        })
        .optional(),
    faq: z.object({
        eyebrow: MultiLanguageFieldSchema,
        title: MultiLanguageFieldSchema,
    }),
});

// --- About Page ---

export const AboutPageWebSchema = z.object({
    hero: PageHeroWebSchema,
    statement: z.string(),
    licenceBody: z.string(),
    action: ActionRefSchema.optional(),
    signatoryBlock: z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            accent: z.string().optional(),
            paragraphs: z.array(z.string()),
            action: ActionRefSchema.optional(),
            image: ImageRefSchema.optional(),
            caption: z.string().optional(),
        })
        .optional(),
    commitments: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        items: z.array(
            z.object({
                title: z.string(),
                body: z.string(),
            })
        ),
    }),
    officesTitle: z.string().optional(),
    partnerQuote: z
        .object({
            title: z.string(),
            body: z.string(),
            action: ActionRefSchema.optional(),
            image: ImageRefSchema.optional(),
        })
        .optional(),
});

export const AboutPageSectionSchema = z.object({
    hero: z.object({
        title: MultiLanguageFieldSchema,
        subtitle: MultiLanguageFieldSchema.optional(),
        image: ImageFieldSchema.optional(),
    }),
    statement: MultiLanguageFieldSchema,
    licenceBody: MultiLanguageFieldSchema,
    action: ActionRefSchema.optional(),
    signatoryBlock: z.object({
        eyebrow: MultiLanguageFieldSchema,
        title: MultiLanguageFieldSchema,
        accent: MultiLanguageFieldSchema.optional(),
        paragraphs: z.array(MultiLanguageFieldSchema),
        action: ActionRefSchema.optional(),
        image: ImageFieldSchema.optional(),
        caption: MultiLanguageFieldSchema.optional(),
    }),
    commitments: z.object({
        title: MultiLanguageFieldSchema,
        subtitle: MultiLanguageFieldSchema.optional(),
        items: z.array(
            z.object({
                title: MultiLanguageFieldSchema,
                body: MultiLanguageFieldSchema,
            })
        ),
    }),
    officesTitle: MultiLanguageFieldSchema,
    partnerQuote: z.object({
        title: MultiLanguageFieldSchema,
        body: MultiLanguageFieldSchema,
        action: ActionRefSchema.optional(),
        image: ImageFieldSchema.optional(),
    }),
});

// --- Legal Pages ---

export const LegalPageWebSchema = z.object({
    version: z.string(),
    updatedAt: z.string(),
    hero: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
    }),
    summary: z.array(z.string()),
    sections: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            body: z.string(),
        })
    ),
    pdfUrl: z.string().optional(),
    questionCard: z
        .object({
            title: z.string(),
            body: z.string(),
            action: ActionRefSchema,
        })
        .optional(),
});

export const LegalPageSectionSchema = z.object({
    version: z.string(),
    updatedAt: z.string().optional(),
    hero: z.object({
        title: MultiLanguageFieldSchema,
        subtitle: MultiLanguageFieldSchema.optional(),
    }),
    summary: z.array(MultiLanguageFieldSchema),
    sections: z.array(
        z.object({
            id: z.string(),
            title: MultiLanguageFieldSchema,
            body: MultiLanguageFieldSchema,
        })
    ),
    pdfUrl: MultiLanguageFieldSchema.optional(),
    questionCard: z
        .object({
            title: MultiLanguageFieldSchema,
            body: MultiLanguageFieldSchema,
            action: ActionRefSchema,
        })
        .optional(),
});
