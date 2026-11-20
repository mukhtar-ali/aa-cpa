import React, { useState } from 'react'
import { ServiceFormSchema, type ServiceAdmin, type ServiceForm } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BilingualField,
  ImageField,
  PublishToggle,
  SortableList,
  TranslationStatusBadge,
} from '@/components/cms'

export interface ServicesFeatureProps {
  initialItems?: ServiceAdmin[]
  onSave?: (data: ServiceForm) => Promise<void> | void
  onReorder?: (ids: string[]) => Promise<void> | void
  onPublishToggle?: (id: string, isPublished: boolean) => Promise<void> | void
}

const emptyForm = (): ServiceForm => ({
  slug: '',
  icon: '',
  image: null,
  heroImage: null,
  highlight: null,
  methodology: [],
  deliverables: [],
  order: 0,
  isPublished: false,
  publishedAt: null,
  title: { ar: '', en: '' },
  summary: { ar: '', en: '' },
  heroSubtitle: { ar: '', en: '' },
  statement: { ar: '', en: '' },
  audience: { ar: '', en: '' },
  whyUs: { ar: '', en: '' },
  metaTitle: { ar: '', en: '' },
  metaDescription: { ar: '', en: '' },
  keywords: { ar: '', en: '' },
  sectorIds: [],
  faqIds: [],
})

export function Services({
  initialItems = [],
  onSave,
  onReorder,
  onPublishToggle,
}: ServicesFeatureProps) {
  const [items, setItems] = useState<ServiceAdmin[]>(initialItems)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const canPublishForm =
    Boolean(form.title?.ar?.trim()) && Boolean(form.summary?.ar?.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = ServiceFormSchema.safeParse(form)
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
    <div className='space-y-6 p-4' data-testid='services-feature'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Services Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4' data-testid='service-form'>
            <div className='space-y-1'>
              <Label htmlFor='service-slug'>Slug *</Label>
              <Input
                id='service-slug'
                data-testid='service-slug-input'
                value={form.slug}
                placeholder='external-audit'
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
              {errors['slug'] && (
                <p className='text-xs text-destructive' role='alert'>
                  {errors['slug']}
                </p>
              )}
            </div>

            <BilingualField
              label='Service Title'
              namePrefix='service-title'
              requiredAr
              value={form.title}
              errorAr={errors['title.ar']}
              onChange={(title) => setForm({ ...form, title })}
            />

            <BilingualField
              label='Service Summary'
              namePrefix='service-summary'
              requiredAr
              multiline
              value={form.summary}
              errorAr={errors['summary.ar']}
              onChange={(summary) => setForm({ ...form, summary })}
            />

            <ImageField
              label='Service Card Image'
              namePrefix='service-image'
              value={form.image as any}
              onChange={(image) =>
                setForm({
                  ...form,
                  image: image
                    ? {
                        url: image.url,
                        width: image.width ?? 1200,
                        height: image.height ?? 800,
                        alt: image.alt,
                      }
                    : null,
                })
              }
            />

            <PublishToggle
              isPublished={form.isPublished}
              canPublish={canPublishForm}
              guardMessage='Arabic title and summary are required before publishing.'
              onToggle={(isPublished) => setForm({ ...form, isPublished })}
            />

            <Button type='submit' data-testid='service-submit-btn'>
              Save Service
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services Order & Status</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableList
            items={items}
            onReorder={(ids, next) => {
              setItems(next)
              void onReorder?.(ids)
            }}
            renderItem={(item) => (
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <p className='font-medium'>{item.title?.ar || item.slug}</p>
                  <p className='text-xs text-muted-foreground'>{item.slug}</p>
                </div>
                <div className='flex items-center gap-3'>
                  <TranslationStatusBadge status={item.translationStatus} />
                  <PublishToggle
                    isPublished={item.isPublished}
                    canPublish={
                      Boolean(item.title?.ar?.trim()) &&
                      Boolean(item.summary?.ar?.trim())
                    }
                    onToggle={(nextPub) => {
                      setItems(
                        items.map((it) =>
                          it.id === item.id ? { ...it, isPublished: nextPub } : it
                        )
                      )
                      void onPublishToggle?.(item.id, nextPub)
                    }}
                  />
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
