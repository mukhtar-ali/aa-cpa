import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  BilingualField,
  TranslationStatusBadge,
  computeTranslationStatus,
  PublishToggle,
  SortableList,
  ImageField,
} from '../index'
import { LANGUAGES } from '@/components/language-tabs'

describe('Admin CMS Kit', () => {
  it('LANGUAGES lists Arabic (ar) first per constitution III', () => {
    expect(LANGUAGES[0].code).toBe('ar')
    expect(LANGUAGES[1].code).toBe('en')
  })

  it('BilingualField renders Arabic (rtl) and English (ltr) inputs with Arabic visible by default', () => {
    const html = renderToStaticMarkup(
      <BilingualField
        label='Service Title'
        name='title'
        required
        value={{ ar: 'التدقيق الخارجي', en: 'External Audit' }}
        onChange={() => {}}
      />
    )
    expect(html).toContain('Service Title')
    expect(html).toContain('dir="rtl"')
    expect(html).toContain('dir="ltr"')
    expect(html).toContain('التدقيق الخارجي')
    expect(html).toContain('External Audit')
  })

  it('computeTranslationStatus and TranslationStatusBadge report complete, partial, and missing accurately', () => {
    expect(
      computeTranslationStatus([
        { ar: 'عنوان', en: 'Title' },
        { ar: 'ملخص', en: '' },
      ])
    ).toEqual({ ar: 'complete', en: 'partial' })

    expect(
      computeTranslationStatus([
        { ar: '', en: '' },
      ])
    ).toEqual({ ar: 'missing', en: 'missing' })

    const html = renderToStaticMarkup(
      <TranslationStatusBadge status={{ ar: 'complete', en: 'missing' }} />
    )
    expect(html).toContain('AR: complete')
    expect(html).toContain('EN: missing')
  })

  it('PublishToggle enforces publish guard when Arabic required fields are missing', () => {
    const blockedHtml = renderToStaticMarkup(
      <PublishToggle
        isPublished={false}
        hasArabicRequired={false}
        onToggle={() => {}}
      />
    )
    expect(blockedHtml).toContain('publish-guard-alert')
    expect(blockedHtml).toContain('Arabic required fields must be filled before publishing')

    const allowedHtml = renderToStaticMarkup(
      <PublishToggle
        isPublished={true}
        hasArabicRequired={true}
        onToggle={() => {}}
      />
    )
    expect(allowedHtml).not.toContain('publish-guard-alert')
    expect(allowedHtml).toContain('Published')
  })

  it('SortableList renders items in order with move up/down controls', () => {
    const items = [
      { id: 's1', title: 'First Service' },
      { id: 's2', title: 'Second Service' },
    ]
    const html = renderToStaticMarkup(
      <SortableList
        items={items}
        renderItem={(item) => <span>{item.title}</span>}
        onReorder={() => {}}
      />
    )
    expect(html).toContain('First Service')
    expect(html).toContain('Second Service')
    expect(html).toContain('Move item 1 up')
    expect(html).toContain('Move item 2 down')
  })

  it('ImageField renders bilingual alt text inputs when image url is set', () => {
    const html = renderToStaticMarkup(
      <ImageField
        label='Cover Image'
        value={{
          url: '/uploads/cover.jpg',
          alt: { ar: 'صورة الغلاف', en: 'Cover image' },
        }}
        onChange={() => {}}
      />
    )
    expect(html).toContain('Cover Image')
    expect(html).toContain('صورة الغلاف')
    expect(html).toContain('Cover image')
  })
})
