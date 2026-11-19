import { useEffect, useState } from 'react'
import { Eye, Loader2 } from 'lucide-react'
import { SectorFormSchema, type SectorAdmin, type SectorForm } from '@repo/shared'
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
import { Switch } from '@/components/ui/switch'
import { LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import {
  BilingualField,
  ImageField,
  PublishToggle,
  TranslationStatusBadge,
  computeTranslationStatus,
} from '@/components/cms'

export interface SectorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: SectorAdmin | null
  onSubmitSector: (values: SectorForm) => Promise<void>
  onPreview?: (slug: string) => void
  isSubmitting?: boolean
}

const emptyBilingual = () => ({ ar: '', en: '' })

export function getDefaultSectorForm(row?: SectorAdmin | null): SectorForm {
  if (!row) {
    return {
      slug: '',
      icon: 'Building2',
      order: 0,
      isPublished: false,
      publishedAt: null,
      featured: false,
      bandImage: null,
      title: emptyBilingual(),
      summary: emptyBilingual(),
      bandTitle: emptyBilingual(),
      bandBody: emptyBilingual(),
      bandCtaLabel: emptyBilingual(),
      stats: [],
      painPoints: [],
      serviceIds: [],
      faqIds: [],
    }
  }

  return {
    slug: row.slug,
    icon: row.icon ?? '',
    order: row.order ?? 0,
    isPublished: row.isPublished ?? false,
    publishedAt: row.publishedAt ?? null,
    featured: row.featured ?? false,
    bandImage: row.bandImage ?? null,
    title: row.title ?? emptyBilingual(),
    summary: row.summary ?? emptyBilingual(),
    bandTitle: row.bandTitle ?? emptyBilingual(),
    bandBody: row.bandBody ?? emptyBilingual(),
    bandCtaLabel: row.bandCtaLabel ?? emptyBilingual(),
    stats: row.stats ?? [],
    painPoints: row.painPoints ?? [],
    serviceIds: row.serviceIds ?? [],
    faqIds: row.faqIds ?? [],
  }
}

export function SectorFormDialog({
  open,
  onOpenChange,
  currentRow,
  onSubmitSector,
  onPreview,
  isSubmitting = false,
}: SectorFormDialogProps) {
  const isEdit = Boolean(currentRow)
  const [lang, setLang] = useState<LanguageCode>('ar')
  const [values, setValues] = useState<SectorForm>(() => getDefaultSectorForm(currentRow))
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setValues(getDefaultSectorForm(currentRow))
      setErrors({})
      setLang('ar')
    }
  }, [open, currentRow])

  const hasArabicRequired = Boolean(values.title.ar?.trim() && values.summary.ar?.trim())
  const translationStatus = computeTranslationStatus([values.title, values.summary])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = SectorFormSchema.safeParse(values)
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
    await onSubmitSector(parsed.data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <div className='flex items-center justify-between gap-2'>
            <DialogTitle>{isEdit ? 'Edit Sector' : 'Create Sector'}</DialogTitle>
            <TranslationStatusBadge status={translationStatus} />
          </div>
          <DialogDescription>
            Arabic title and summary are required before publishing.
          </DialogDescription>
        </DialogHeader>

        <form id='sector-form' onSubmit={handleSubmit} className='max-h-[70vh] space-y-4 overflow-y-auto px-1 py-2'>
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
              <Label htmlFor='sector-slug'>
                Slug <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='sector-slug'
                dir='ltr'
                placeholder='financial-services'
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
              <Label htmlFor='sector-icon'>Icon Name</Label>
              <Input
                id='sector-icon'
                dir='ltr'
                placeholder='Building2'
                value={values.icon ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, icon: e.target.value }))}
              />
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Switch
              id='sector-featured'
              checked={values.featured}
              onCheckedChange={(checked) => setValues((prev) => ({ ...prev, featured: checked }))}
            />
            <Label htmlFor='sector-featured' className='text-sm font-medium'>
              Featured Sector (Highlight Band)
            </Label>
          </div>

          <BilingualField
            name='title'
            label='Sector Title'
            required
            activeLanguage={lang}
            value={values.title}
            onChange={(title) => setValues((prev) => ({ ...prev, title }))}
            error={errors['title.ar'] || errors.title}
          />

          <BilingualField
            name='summary'
            label='Sector Summary'
            type='textarea'
            required
            activeLanguage={lang}
            value={values.summary}
            onChange={(summary) => setValues((prev) => ({ ...prev, summary }))}
            error={errors['summary.ar'] || errors.summary}
          />

          <BilingualField
            name='bandTitle'
            label='Featured Band Title'
            activeLanguage={lang}
            value={values.bandTitle}
            onChange={(bandTitle) => setValues((prev) => ({ ...prev, bandTitle }))}
          />

          <BilingualField
            name='bandBody'
            label='Featured Band Description'
            type='textarea'
            activeLanguage={lang}
            value={values.bandBody}
            onChange={(bandBody) => setValues((prev) => ({ ...prev, bandBody }))}
          />

          <ImageField
            label='Featured Band Image'
            value={values.bandImage as any}
            onChange={(bandImage) => setValues((prev) => ({ ...prev, bandImage: bandImage as any }))}
          />
        </form>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type='submit' form='sector-form' disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
            {isEdit ? 'Save Changes' : 'Create Sector'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
