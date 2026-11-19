import { describe, expect, it } from 'vitest'
import {
  ArticleCategoryFormSchema,
  AuthorFormSchema,
  ClientLogoFormSchema,
  CredentialFormSchema,
  EstimatorConfigSchema,
  FaqItemFormSchema,
  JobDepartmentFormSchema,
  NotificationSettingsSchema,
  OfficeFormSchema,
  SpamSettingsSchema,
  TestimonialFormSchema,
} from '@repo/shared'

describe('Admin Reference, Taxonomies, Estimator & Settings Schemas', () => {
  it('validates ArticleCategoryFormSchema and JobDepartmentFormSchema', () => {
    expect(
      ArticleCategoryFormSchema.safeParse({
        slug: 'zakat-insights',
        name: { ar: 'رؤى زكوية', en: 'Zakat Insights' },
        order: 0,
        isCaseStory: false,
      }).success
    ).toBe(true)

    expect(
      JobDepartmentFormSchema.safeParse({
        slug: 'external-audit',
        name: { ar: 'التدقيق الخارجي', en: 'External Audit' },
        order: 1,
      }).success
    ).toBe(true)
  })

  it('validates AuthorFormSchema, OfficeFormSchema, TestimonialFormSchema, ClientLogoFormSchema, CredentialFormSchema, FaqItemFormSchema', () => {
    expect(
      AuthorFormSchema.safeParse({
        name: { ar: 'أحمد العبدالله', en: 'Ahmed Al-Abdullah' },
        role: { ar: 'شريك تدقيق', en: 'Audit Partner' },
        bio: { ar: 'خبرة ٢٠ عاماً', en: '20 years experience' },
        order: 0,
      }).success
    ).toBe(true)

    expect(
      OfficeFormSchema.safeParse({
        city: { ar: 'الرياض', en: 'Riyadh' },
        address: { ar: 'طريق الملك فهد', en: 'King Fahd Rd' },
        isHeadquarters: true,
        order: 0,
        isPublished: true,
      }).success
    ).toBe(true)

    expect(
      TestimonialFormSchema.safeParse({
        quote: { ar: 'خدمة ممتازة', en: 'Excellent service' },
        rating: 5,
        name: { ar: 'سلطان', en: 'Sultan' },
        role: { ar: 'المدير المالي', en: 'CFO' },
        order: 0,
        isPublished: true,
        placement: ['home'],
      }).success
    ).toBe(true)

    expect(
      ClientLogoFormSchema.safeParse({
        name: 'SABIC',
        logo: { url: '/uploads/sabic.svg', width: 200, height: 100, alt: { ar: 'سابك', en: 'SABIC' } },
        row: 1,
        order: 0,
        isPublished: true,
      }).success
    ).toBe(true)

    expect(
      CredentialFormSchema.safeParse({
        name: { ar: 'الهئىة السعودية للمراجعين والمحاسبين', en: 'SOCPA' },
        logo: { url: '/uploads/socpa.svg', width: 200, height: 100, alt: { ar: 'SOCPA', en: 'SOCPA' } },
        order: 0,
        isPublished: true,
      }).success
    ).toBe(true)

    expect(
      FaqItemFormSchema.safeParse({
        question: { ar: 'ما هي متطلبات التدقيق؟', en: 'What are audit requirements?' },
        answer: { ar: 'القوائم المالية والسجل التجاري', en: 'Financial statements and CR' },
        scope: 'global',
        order: 0,
        isPublished: true,
      }).success
    ).toBe(true)
  })

  it('validates NotificationSettingsSchema, SpamSettingsSchema, and EstimatorConfigSchema', () => {
    expect(
      NotificationSettingsSchema.safeParse({
        defaultInbox: 'info@cpa.sa',
        careersInbox: 'careers@cpa.sa',
        serviceRecipients: {},
        retentionMonths: 12,
      }).success
    ).toBe(true)

    expect(
      SpamSettingsSchema.safeParse({
        turnstileEnabled: false,
        turnstileSiteKey: '',
        minFillSeconds: 3,
      }).success
    ).toBe(true)

    expect(
      EstimatorConfigSchema.safeParse({
        status: 'approved',
        currency: 'SAR',
        roundingTo: 500,
        spreadPercent: 15,
        disclaimer: { ar: 'تقدير استرشادي', en: 'Indicative estimate' },
        questions: [],
        pricing: {
          serviceBases: { 'external-audit': 25000 },
          revenueBands: [{ maxRevenue: 5000000, factor: 1.0 }],
          entityFactors: { '1': 1.0 },
          booksFactors: { monthly: 1.0 },
        },
      }).success
    ).toBe(true)
  })
})
