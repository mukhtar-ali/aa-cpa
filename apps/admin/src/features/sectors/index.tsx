import React, { useState } from 'react'
import { SectorFormSchema, type SectorAdmin, type SectorForm } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BilingualField,
  PublishToggle,
  SortableList,
  TranslationStatusBadge,
} from '@/components/cms'

export interface SectorsFeatureProps {
  initialItems?: SectorAdmin[]
  onSave?: (data: SectorForm) => Promise<void> | void
  onReorder?: (ids: string[]) => Promise<void> | void
}

const emptySector = (): SectorForm => ({
  slug: '',
  icon: '',
  order: 0,
  isPublished: false,
  featured: false,
  bandImage: null,
  title: { ar: '', en: '' },
  summary: { ar: '', en: '' },
  bandTitle: { ar: '', en: '' },
  bandBody: { ar: '', en: '' },
  bandCtaLabel: { ar: '', en: '' },
  stats: [],
  painPoints: [],
  serviceIds: [],
  faqIds: [],
})

export function Sectors({
  initialItems = [],
  onSave,
  onReorder,
}: SectorsFeatureProps) {
  const [items, setItems] = useState<SectorAdmin[]>(initialItems)
  const [form, setForm] = useState<SectorForm>(emptySector)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const canPublish =
    Boolean(form.title?.ar?.trim()) && Boolean(form.summary?.ar?.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = SectorFormSchema.safeParse(form)
    if (!parsed.success) {
      const nextErr: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        nextErr[issue.path.join('.')] = issue.message
      }
      setErrors(nextErr)
      return
    }
    setErrors({})
    await onSave?.(parsed.data)
  }

  return (
    <div className='space-y-6 p-4' data-testid='sectors-feature'>
      <h1 className='text-2xl font-bold'>Sectors Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Sector Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4' data-testid='sector-form'>
            <div className='space-y-1'>
              <Label htmlFor='sector-slug'>Slug *</Label>
              <Input
                id='sector-slug'
                data-testid='sector-slug-input'
                value={form.slug}
                placeholder='contracting-real-estate'
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
              {errors['slug'] && (
                <p className='text-xs text-destructive' role='alert'>
                  {errors['slug']}
                </p>
              )}
            </div>

            <BilingualField
              label='Sector Title'
              namePrefix='sector-title'
              requiredAr
              value={form.title}
              errorAr={errors['title.ar']}
              onChange={(title) => setForm({ ...form, title })}
            />

            <BilingualField
              label='Sector Summary'
              namePrefix='sector-summary'
              requiredAr
              multiline
              value={form.summary}
              errorAr={errors['summary.ar']}
              onChange={(summary) => setForm({ ...form, summary })}
            />

            <PublishToggle
              isPublished={form.isPublished}
              canPublish={canPublish}
              onToggle={(isPublished) => setForm({ ...form, isPublished })}
            />

            <Button type='submit' data-testid='sector-submit-btn'>
              Save Sector
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sectors List</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableList
            items={items}
            onReorder={(ids, next) => {
              setItems(next)
              void onReorder?.(ids)
            }}
            renderItem={(item) => (
              <div className='flex items-center justify-between'>
                <span>{item.title?.ar || item.slug}</span>
                <TranslationStatusBadge status={item.translationStatus} />
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
