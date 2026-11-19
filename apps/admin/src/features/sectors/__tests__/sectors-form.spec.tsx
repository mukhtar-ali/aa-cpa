import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SectorFormSchema } from '@repo/shared'
import { getDefaultSectorForm } from '../components/sector-form-dialog'
import { PublishToggle, SortableList, TranslationStatusBadge } from '@/components/cms'

describe('Admin Sectors Feature & Form Validation', () => {
  it('getDefaultSectorForm initializes default sector values', () => {
    const form = getDefaultSectorForm(null)
    expect(form.slug).toBe('')
    expect(form.featured).toBe(false)
    expect(form.title).toEqual({ ar: '', en: '' })
    expect(form.summary).toEqual({ ar: '', en: '' })
  })

  it('SectorFormSchema validates Arabic required fields and slug format', () => {
    const invalid = {
      ...getDefaultSectorForm(null),
      slug: 'Invalid Slug!',
    }
    const parsed = SectorFormSchema.safeParse(invalid)
    expect(parsed.success).toBe(false)

    const valid = {
      ...getDefaultSectorForm(null),
      slug: 'financial-sector',
      featured: true,
      title: { ar: 'القطاع المالي', en: 'Financial Sector' },
      summary: { ar: 'حلول محاسبية للبنوك وشركات التمويل', en: 'Solutions for banks' },
    }
    expect(SectorFormSchema.safeParse(valid).success).toBe(true)
  })

  it('renders sortable sector rows with publish guard and translation status badges', () => {
    const sectors = [
      {
        id: 'sec-1',
        slug: 'banking',
        title: { ar: 'قطاع البنوك', en: 'Banking' },
        summary: { ar: 'ملخص', en: 'Summary' },
        isPublished: true,
      },
    ]

    const html = renderToStaticMarkup(
      <SortableList
        items={sectors}
        onReorder={() => {}}
        renderItem={(sec) => (
          <div>
            <span>{sec.title.ar}</span>
            <TranslationStatusBadge fields={[sec.title, sec.summary]} />
            <PublishToggle
              isPublished={sec.isPublished}
              hasArabicRequired={Boolean(sec.title.ar && sec.summary.ar)}
              onToggle={() => {}}
            />
          </div>
        )}
      />
    )

    expect(html).toContain('قطاع البنوك')
    expect(html).toContain('AR: complete')
    expect(html).toContain('EN: complete')
    expect(html).toContain('Published')
  })
})
