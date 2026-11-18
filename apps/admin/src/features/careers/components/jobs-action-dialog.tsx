import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
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
import { useCreateJob, useUpdateJob } from '../hooks/use-jobs'

type JobsActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: JobModel | null
}

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full time' },
  { value: 'part_time', label: 'Part time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
] as const

function toFormValues(job?: JobModel | null): JobFormModel {
  if (!job) return getDefaultJobForm()
  return {
    title: job.title,
    description: job.description,
    body: job.body,
    location: job.location,
    employmentType: job.employmentType,
    isPublished: job.isPublished,
    slug: job.slug,
  }
}

export function JobsActionDialog({ open, onOpenChange, currentRow }: JobsActionDialogProps) {
  const isEdit = !!currentRow
  const createJob = useCreateJob()
  const updateJob = useUpdateJob()
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  const form = useForm<JobFormModel>({
    resolver: formResolver(JobFormSchema),
    defaultValues: toFormValues(currentRow),
  })

  useEffect(() => {
    if (open) form.reset(toFormValues(currentRow))
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
            {isEdit
              ? 'Update the job posting below. Content fields support English and Arabic.'
              : 'Create a new job posting. Content fields support English and Arabic.'}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto px-0.5 py-1'>
          <Form {...form}>
            <form id='job-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <LanguageTabs value={lang} onValueChange={setLang} />

              {LANGUAGES.map((l) => (
                <div key={l.code} className={l.code === lang ? 'space-y-4' : 'hidden'}>
                  <FormField
                    control={form.control}
                    name={`title.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title ({l.label})</FormLabel>
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
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} placeholder='e.g. Cairo, Egypt' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`description.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short description ({l.label})</FormLabel>
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
                        <Input placeholder='auto-generated from EN title' {...field} value={field.value ?? ''} />
                      </FormControl>
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
              </div>

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
