import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ServiceFormSchema } from '@repo/shared'
import { getDefaultServiceForm } from '../components/service-form-dialog'
import { BilingualField, PublishToggle, SortableList, TranslationStatusBadge } from '@/components/cms'

describe('Admin Services Feature & Form Validation', () => {
  it('getDefaultServiceForm initializes required bilingual structures and empty arrays', () => {
    const form = getDefaultServiceForm(null)
    expect(form.slug).toBe('')
    expect(form.title).toEqual({ ar: '', en: '' })
    expect(form.summary).toEqual({ ar: '', en: '' })
    expect(form.methodology).toEqual([])
    expect(form.deliverables).toEqual([])
    expect(form.isPublished).toBe(false)
  })

  it('ServiceFormSchema rejects missing Arabic title/summary or invalid slug', () => {
    const invalid = getDefaultServiceForm(null)
    const parsed = ServiceFormSchema.safeParse(invalid)
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const paths = parsed.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('slug')
      expect(paths).toContain('title.ar')
      expect(paths).toContain('summary.ar')
    }
  })

  it('ServiceFormSchema accepts valid Arabic service even when English translation is empty', () => {
    const validArOnly = {
      ...getDefaultServiceForm(null),
      slug: 'external-audit',
      title: { ar: 'التدقيق الخارجي', en: '' },
      summary: { ar: 'خدمات مراجعة وتدقيق القوائم المالية', en: '' },
    }
    const parsed = ServiceFormSchema.safeParse(validArOnly)
    expect(parsed.success).toBe(true)
  })

  it('renders service bilingual fields, translation status, publish guard, and sortable reorder list', () => {
    const items = [
      {
        id: 'srv-1',
        slug: 'external-audit',
        title: { ar: 'التدقيق الخارجي', en: 'External Audit' },
        summary: { ar: 'ملخص', en: '' },
        isPublished: false,
      },
      {
        id: 'srv-2',
        slug: 'zakat-tax',
        title: { ar: '', en: 'Zakat & Tax' },
        summary: { ar: '', en: '' },
        isPublished: false,
      },
    ]

    const html = renderToStaticMarkup(
      <div>
        <BilingualField
          name='title'
          label='Title'
          required
          value={items[0].title}
          onChange={() => {}}
        />
        <SortableList
          items={items}
          onReorder={() => {}}
          renderItem={(s) => (
            <div>
              <span>{s.title.ar || s.slug}</span>
              <TranslationStatusBadge fields={[s.title, s.summary]} />
              <PublishToggle
                isPublished={s.isPublished}
                hasArabicRequired={Boolean(s.title.ar && s.summary.ar)}
                onToggle={() => {}}
              />
            </div>
          )}
        />
      </div>
    )

    expect(html).toContain('التدقيق الخارجي')
    expect(html).toContain('AR: complete')
    expect(html).toContain('EN: partial')
    expect(html).toContain('AR: missing')
    expect(html).toContain('publish-guard-alert')
  })
})
