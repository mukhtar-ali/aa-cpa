import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { formResolver } from '@/lib/form-resolver'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { getDefaultJobForm, JobFormSchema, type JobFormModel, type JobModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from '@/components/rich-text/rich-text-editor'
import { LANGUAGES, LanguageTabs } from '@/components/language-tabs'
import { SearchSnippetPreview } from '@/components/cms/search-snippet-preview'
import { ogImageUrl } from '@/lib/og-image'
import { BilingualField } from '@/components/cms'
import { getAdminJobDepartments, getAdminOffices } from '@/lib/reference-api'
import { useCreateJob, useUpdateJob } from '../hooks/use-jobs'

type JobsActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: JobModel | null
}

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full time (دوام كامل)' },
  { value: 'part_time', label: 'Part time (دوام جزئي)' },
  { value: 'contract', label: 'Contract (عقد)' },
  { value: 'internship', label: 'Internship (تدريب)' },
  { value: 'cooperative_training', label: 'Cooperative Training (تدريب تعاوني)' },
] as const

function toFormValues(job?: JobModel | null): JobFormModel {
  if (!job) return getDefaultJobForm()
  // The admin list model does not declare every field the form edits (the API returns them); read them loosely.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyJob = job as any
  return {
    title: job.title,
    summary: anyJob.summary ?? anyJob.description ?? { ar: '', en: '' },
    body: job.body,
    location: job.location,
    metaTitle: anyJob.metaTitle ?? { ar: '', en: '' },
    metaDescription: anyJob.metaDescription ?? { ar: '', en: '' },
    keywords: anyJob.keywords ?? { ar: '', en: '' },
    departmentId: anyJob.departmentId ?? '',
    officeId: anyJob.officeId ?? null,
    employmentType: job.employmentType,
    experienceMin: anyJob.experienceMin ?? null,
    experienceMax: anyJob.experienceMax ?? null,
    closesAt: anyJob.closesAt ?? null,
    responsibilities: anyJob.responsibilities ?? [],
    requirements: anyJob.requirements ?? [],
    benefits: anyJob.benefits ?? [],
    order: anyJob.order ?? 0,
    isPublished: job.isPublished,
    publishedAt: anyJob.publishedAt ?? null,
    ogImage: ogImageUrl(anyJob.ogImage),
    noindex: anyJob.noindex ?? false,
    slug: job.slug,
  }
}

export function JobsActionDialog({ open, onOpenChange, currentRow }: JobsActionDialogProps) {
  const isEdit = !!currentRow
  const createJob = useCreateJob()
  const updateJob = useUpdateJob()
  const [lang, setLang] = useState<'en' | 'ar'>('ar')

  const { data: departments = [] } = useQuery({
    queryKey: ['admin-job-departments'],
    queryFn: getAdminJobDepartments,
    enabled: open,
  })

  const { data: offices = [] } = useQuery({
    queryKey: ['admin-offices'],
    queryFn: getAdminOffices,
    enabled: open,
  })

  const form = useForm<JobFormModel>({
    resolver: formResolver(JobFormSchema),
    defaultValues: toFormValues(currentRow),
  })

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(currentRow))
      setLang('ar')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRow])

  const onSubmit = async (values: JobFormModel) => {
    try {
      if (isEdit && currentRow) {
        await updateJob.mutateAsync({ id: currentRow.id, data: values })
      } else {
        await createJob.mutateAsync(values)
      }
      onOpenChange(false)
    } catch {
      // Error handled by mutation hook
    }
  }

  const isLoading = createJob.isPending || updateJob.isPending
  const responsibilities = form.watch('responsibilities') ?? []
  const requirements = form.watch('requirements') ?? []

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Job Posting' : 'Add Job Posting'}</DialogTitle>
          <DialogDescription>
            Manage bilingual CPA job postings, departments, offices, and closing dates.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto px-0.5 py-1'>
          <Form {...form}>
            <form id='job-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <LanguageTabs value={lang} onValueChange={setLang} />

              <SearchSnippetPreview
                title={form.watch(`metaTitle.${lang}`) || form.watch(`title.${lang}`) || ''}
                description={form.watch(`metaDescription.${lang}`) || form.watch(`summary.${lang}`) || ''}
                slug={form.watch('slug') || ''}
                pathPrefix='careers'
                lang={lang}
                noindex={form.watch('noindex')}
              />

              {LANGUAGES.map((l) => (
                <div key={l.code} className={l.code === lang ? 'space-y-4' : 'hidden'}>
                  <FormField
                    control={form.control}
                    name={`title.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Title ({l.label}) {l.code === 'ar' && <span className='text-destructive'>*</span>}
                        </FormLabel>
                        <FormControl>
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} placeholder='Job title' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`location.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location ({l.label})</FormLabel>
                        <FormControl>
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} placeholder='e.g. الرياض / Riyadh' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`summary.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary ({l.label})</FormLabel>
                        <FormControl>
                          <Textarea
                            dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                            rows={2}
                            placeholder='Shown on listing pages'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`body.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full description ({l.label})</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            language={l.code}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='rounded-md border p-3 bg-muted/20'>
                    <p className='mb-2 text-xs font-medium text-muted-foreground'>SEO ({l.label})</p>
                    <div className='space-y-3'>
                      <FormField
                        control={form.control}
                        name={`metaTitle.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`metaDescription.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea dir={l.code === 'ar' ? 'rtl' : 'ltr'} rows={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`keywords.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Keywords</FormLabel>
                            <FormControl>
                              <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} placeholder='comma, separated' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder='senior-auditor' {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='departmentId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select department' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name?.ar || d.name?.en || d.slug}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='officeId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select office' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {offices.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.city?.ar || o.city?.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='employmentType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMPLOYMENT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='experienceMin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Experience (Years)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='experienceMax'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Experience (Years)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='closesAt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closes At (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          value={
                            field.value
                              ? new Date(field.value as string).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Responsibilities list */}
              <div className='space-y-2 rounded-lg border p-3'>
                <div className='flex items-center justify-between'>
                  <FormLabel>Responsibilities ({responsibilities.length})</FormLabel>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      form.setValue('responsibilities', [...responsibilities, { ar: '', en: '' }])
                    }
                  >
                    <Plus className='me-1 h-3.5 w-3.5' />
                    Add Responsibility
                  </Button>
                </div>
                {responsibilities.map((item, idx) => (
                  <div key={idx} className='flex items-end gap-2'>
                    <div className='flex-1'>
                      <BilingualField
                        name={`resp-${idx}`}
                        label={`Responsibility #${idx + 1}`}
                        activeLanguage={lang}
                        value={item}
                        onChange={(nextVal) => {
                          const next = [...responsibilities]
                          next[idx] = nextVal
                          form.setValue('responsibilities', next)
                        }}
                      />
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='text-destructive'
                      onClick={() =>
                        form.setValue(
                          'responsibilities',
                          responsibilities.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Requirements list */}
              <div className='space-y-2 rounded-lg border p-3'>
                <div className='flex items-center justify-between'>
                  <FormLabel>Requirements ({requirements.length})</FormLabel>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      form.setValue('requirements', [...requirements, { ar: '', en: '' }])
                    }
                  >
                    <Plus className='me-1 h-3.5 w-3.5' />
                    Add Requirement
                  </Button>
                </div>
                {requirements.map((item, idx) => (
                  <div key={idx} className='flex items-end gap-2'>
                    <div className='flex-1'>
                      <BilingualField
                        name={`req-${idx}`}
                        label={`Requirement #${idx + 1}`}
                        activeLanguage={lang}
                        value={item}
                        onChange={(nextVal) => {
                          const next = [...requirements]
                          next[idx] = nextVal
                          form.setValue('requirements', next)
                        }}
                      />
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='text-destructive'
                      onClick={() =>
                        form.setValue(
                          'requirements',
                          requirements.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name='ogImage'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Open Graph Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://...'
                        value={ogImageUrl(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-wrap items-center gap-8'>
                <FormField
                  control={form.control}
                  name='isPublished'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center gap-2'>
                      <FormLabel className='mb-0'>Published</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='noindex'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center gap-2'>
                      <FormLabel className='mb-0'>noindex (Hide from Search)</FormLabel>
                      <FormControl>
                        <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='job-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
