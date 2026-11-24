import { useState } from 'react'
import { Eye, Loader2, Plus, Trash2 } from 'lucide-react'
import { ServiceFormSchema, type ServiceAdmin, type ServiceForm } from '@repo/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { Switch } from '@/components/ui/switch'
import { SearchSnippetPreview } from '@/components/cms/search-snippet-preview'
import { ogImageUrl } from '@/lib/og-image'
import {
  BilingualField,
  ImageField,
  PublishToggle,
  TranslationStatusBadge,
  computeTranslationStatus,
  type ImageFieldValue,
} from '@/components/cms'

export interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ServiceAdmin | null
  onSubmitService: (values: ServiceForm) => Promise<void>
  onPreview?: (slug: string) => void
  isSubmitting?: boolean
}

const emptyBilingual = () => ({ ar: '', en: '' })

export function getDefaultServiceForm(row?: ServiceAdmin | null): ServiceForm {
  if (!row) {
    return {
      slug: '',
      icon: 'ShieldCheck',
      image: null,
      heroImage: null,
      highlight: null,
      methodology: [],
      deliverables: [],
      order: 0,
      isPublished: false,
      publishedAt: null,
      title: emptyBilingual(),
      summary: emptyBilingual(),
      heroSubtitle: emptyBilingual(),
      statement: emptyBilingual(),
      audience: emptyBilingual(),
      whyUs: emptyBilingual(),
      metaTitle: emptyBilingual(),
      metaDescription: emptyBilingual(),
      keywords: emptyBilingual(),
      ogImage: null,
      noindex: false,
      sectorIds: [],
      faqIds: [],
    }
  }

  return {
    slug: row.slug,
    icon: row.icon ?? '',
    image: row.image ?? null,
    heroImage: row.heroImage ?? null,
    highlight: row.highlight ?? null,
    methodology: row.methodology ?? [],
    deliverables: row.deliverables ?? [],
    order: row.order ?? 0,
    isPublished: row.isPublished ?? false,
    publishedAt: row.publishedAt ?? null,
    title: row.title ?? emptyBilingual(),
    summary: row.summary ?? emptyBilingual(),
    heroSubtitle: row.heroSubtitle ?? emptyBilingual(),
    statement: row.statement ?? emptyBilingual(),
    audience: row.audience ?? emptyBilingual(),
    whyUs: row.whyUs ?? emptyBilingual(),
    metaTitle: row.metaTitle ?? emptyBilingual(),
    metaDescription: row.metaDescription ?? emptyBilingual(),
    keywords: row.keywords ?? emptyBilingual(),
    ogImage: (row as { ogImage?: never } | null | undefined)?.ogImage ?? null,
    noindex: (row as { noindex?: boolean } | null | undefined)?.noindex ?? false,
    sectorIds: row.sectorIds ?? [],
    faqIds: row.faqIds ?? [],
  }
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  currentRow,
  onSubmitService,
  onPreview,
  isSubmitting = false,
}: ServiceFormDialogProps) {
  const isEdit = Boolean(currentRow)
  const [lang, setLang] = useState<LanguageCode>('ar')
  const [values, setValues] = useState<ServiceForm>(() => getDefaultServiceForm(currentRow))
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset the form whenever the dialog opens or switches row. Done while rendering (React's documented way to adjust state to new props)
  // rather than in an effect, which would render the stale form first.
  const [seen, setSeen] = useState<{ open: boolean; row: typeof currentRow }>({ open: false, row: undefined })
  if (seen.open !== open || seen.row !== currentRow) {
    setSeen({ open, row: currentRow })
    if (open) {
      setValues(getDefaultServiceForm(currentRow))
      setErrors({})
      setLang('ar')
    }
  }

  const hasArabicRequired = Boolean(values.title.ar?.trim() && values.summary.ar?.trim())
  const translationStatus = computeTranslationStatus([values.title, values.summary])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = ServiceFormSchema.safeParse(values)
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || 'form'
        if (!nextErrors[key]) nextErrors[key] = issue.message
      }
      setErrors(nextErrors)
      return
    }
    setErrors({})
    await onSubmitService(parsed.data)
    onOpenChange(false)
  }

  const addMethodologyStep = () => {
    setValues((prev) => ({
      ...prev,
      methodology: [...prev.methodology, { title: emptyBilingual(), body: emptyBilingual() }],
    }))
  }

  const removeMethodologyStep = (idx: number) => {
    setValues((prev) => ({
      ...prev,
      methodology: prev.methodology.filter((_, i) => i !== idx),
    }))
  }

  const addDeliverableItem = () => {
    setValues((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, { title: emptyBilingual(), body: emptyBilingual() }],
    }))
  }

  const removeDeliverableItem = (idx: number) => {
    setValues((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== idx),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <div className='flex items-center justify-between gap-2'>
            <DialogTitle>{isEdit ? 'Edit Service' : 'Create Service'}</DialogTitle>
            <TranslationStatusBadge status={translationStatus} />
          </div>
          <DialogDescription>
            Arabic title and summary are required before publishing.
          </DialogDescription>
        </DialogHeader>

        <form id='service-form' onSubmit={handleSubmit} className='max-h-[70vh] space-y-5 overflow-y-auto px-1 py-2'>
          <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3'>
            <LanguageTabs value={lang} onValueChange={setLang} />
            <div className='flex items-center gap-3'>
              <PublishToggle
                isPublished={values.isPublished}
                hasArabicRequired={hasArabicRequired}
                onToggle={(next) => setValues((prev) => ({ ...prev, isPublished: next }))}
              />
              {values.slug && onPreview && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => onPreview(values.slug)}
                >
                  <Eye className='me-1.5 h-4 w-4' />
                  Preview
                </Button>
              )}
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='service-slug'>
                Slug <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='service-slug'
                dir='ltr'
                placeholder='external-audit'
                value={values.slug}
                onChange={(e) => setValues((prev) => ({ ...prev, slug: e.target.value }))}
              />
              {errors.slug && (
                <p role='alert' className='text-xs text-destructive'>
                  {errors.slug}
                </p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='service-icon'>Icon Name</Label>
              <Input
                id='service-icon'
                dir='ltr'
                placeholder='ShieldCheck'
                value={values.icon ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, icon: e.target.value }))}
              />
            </div>
          </div>

          <BilingualField
            name='title'
            label='Title'
            required
            activeLanguage={lang}
            value={values.title}
            onChange={(title) => setValues((prev) => ({ ...prev, title }))}
            error={errors['title.ar'] || errors.title}
          />

          <BilingualField
            name='summary'
            label='Summary'
            type='textarea'
            required
            activeLanguage={lang}
            value={values.summary}
            onChange={(summary) => setValues((prev) => ({ ...prev, summary }))}
            error={errors['summary.ar'] || errors.summary}
          />

          <BilingualField
            name='statement'
            label='Value Statement'
            type='textarea'
            activeLanguage={lang}
            value={values.statement}
            onChange={(statement) => setValues((prev) => ({ ...prev, statement }))}
          />

          <BilingualField
            name='audience'
            label='Target Audience'
            type='textarea'
            activeLanguage={lang}
            value={values.audience}
            onChange={(audience) => setValues((prev) => ({ ...prev, audience }))}
          />

          <BilingualField
            name='whyUs'
            label='Why Choose Us'
            type='textarea'
            activeLanguage={lang}
            value={values.whyUs}
            onChange={(whyUs) => setValues((prev) => ({ ...prev, whyUs }))}
          />

          <ImageField
            label='Service Image'
            value={values.image as ImageFieldValue | null | undefined}
            onChange={(image) => setValues((prev) => ({ ...prev, image: image as ServiceForm['image'] }))}
          />

          {/* Methodology Editor */}
          <div className='space-y-3 rounded-lg border p-3'>
            <div className='flex items-center justify-between'>
              <Label className='text-sm font-semibold'>Methodology Steps ({values.methodology.length})</Label>
              <Button type='button' variant='outline' size='sm' onClick={addMethodologyStep}>
                <Plus className='me-1 h-3.5 w-3.5' />
                Add Step
              </Button>
            </div>
            {values.methodology.map((step, idx) => (
              <div key={idx} className='space-y-2 rounded-md border bg-background p-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-muted-foreground'>Step #{idx + 1}</span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 text-destructive'
                    onClick={() => removeMethodologyStep(idx)}
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
                </div>
                <BilingualField
                  name={`methodology-${idx}-title`}
                  label='Step Title'
                  activeLanguage={lang}
                  value={step.title}
                  onChange={(title) =>
                    setValues((prev) => {
                      const next = [...prev.methodology]
                      next[idx] = { ...next[idx], title }
                      return { ...prev, methodology: next }
                    })
                  }
                />
                <BilingualField
                  name={`methodology-${idx}-body`}
                  label='Step Description'
                  type='textarea'
                  rows={2}
                  activeLanguage={lang}
                  value={step.body}
                  onChange={(body) =>
                    setValues((prev) => {
                      const next = [...prev.methodology]
                      next[idx] = { ...next[idx], body }
                      return { ...prev, methodology: next }
                    })
                  }
                />
              </div>
            ))}
          </div>

          {/* Deliverables Editor */}
          <div className='space-y-3 rounded-lg border p-3'>
            <div className='flex items-center justify-between'>
              <Label className='text-sm font-semibold'>Deliverables ({values.deliverables.length})</Label>
              <Button type='button' variant='outline' size='sm' onClick={addDeliverableItem}>
                <Plus className='me-1 h-3.5 w-3.5' />
                Add Deliverable
              </Button>
            </div>
            {values.deliverables.map((item, idx) => (
              <div key={idx} className='space-y-2 rounded-md border bg-background p-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-muted-foreground'>Deliverable #{idx + 1}</span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 text-destructive'
                    onClick={() => removeDeliverableItem(idx)}
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
                </div>
                <BilingualField
                  name={`deliverable-${idx}-title`}
                  label='Deliverable Title'
                  activeLanguage={lang}
                  value={item.title}
                  onChange={(title) =>
                    setValues((prev) => {
                      const next = [...prev.deliverables]
                      next[idx] = { ...next[idx], title }
                      return { ...prev, deliverables: next }
                    })
                  }
                />
              </div>
            ))}
          </div>

          {/* SEO & Search Snippet Preview */}
          <div className='space-y-4 rounded-lg border p-4 bg-muted/20'>
            <Label className='text-sm font-semibold'>SEO & Social Search Preview</Label>
            <SearchSnippetPreview
              title={values.metaTitle?.[lang] || values.title?.[lang] || ''}
              description={values.metaDescription?.[lang] || values.summary?.[lang] || ''}
              slug={values.slug || ''}
              pathPrefix='services'
              lang={lang}
              noindex={values.noindex}
            />

            <BilingualField
              name='metaTitle'
              label='Meta Title'
              activeLanguage={lang}
              value={values.metaTitle || emptyBilingual()}
              onChange={(metaTitle) => setValues((prev) => ({ ...prev, metaTitle }))}
            />

            <BilingualField
              name='metaDescription'
              label='Meta Description'
              type='textarea'
              activeLanguage={lang}
              value={values.metaDescription || emptyBilingual()}
              onChange={(metaDescription) => setValues((prev) => ({ ...prev, metaDescription }))}
            />

            <BilingualField
              name='keywords'
              label='Keywords'
              activeLanguage={lang}
              value={values.keywords || emptyBilingual()}
              onChange={(keywords) => setValues((prev) => ({ ...prev, keywords }))}
            />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='service-og-image'>Custom OG Image URL</Label>
                <Input
                  id='service-og-image'
                  placeholder='https://...'
                  value={ogImageUrl(values.ogImage)}
                  onChange={(e) => setValues((prev) => ({ ...prev, ogImage: e.target.value }))}
                />
              </div>

              <div className='flex items-center justify-between rounded-md border p-3 bg-card'>
                <div className='space-y-0.5'>
                  <Label htmlFor='service-noindex' className='text-sm font-medium'>
                    noindex (Hide from Search)
                  </Label>
                  <p className='text-xs text-muted-foreground'>
                    Tell search engines not to index this service.
                  </p>
                </div>
                <Switch
                  id='service-noindex'
                  checked={values.noindex ?? false}
                  onCheckedChange={(noindex) => setValues((prev) => ({ ...prev, noindex }))}
                />
              </div>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type='submit' form='service-form' disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
            {isEdit ? 'Save Changes' : 'Create Service'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
