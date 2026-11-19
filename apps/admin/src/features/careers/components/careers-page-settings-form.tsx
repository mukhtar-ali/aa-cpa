import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  CareersPageSettingsSchema,
  getDefaultCareersPageSettings,
  getDefaultMultiLanguageField,
  type CareersPageSettingsModel,
} from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploadField } from '@/components/upload/image-upload-field'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { useCareersPageSettings, useUpdateCareersPageSettings } from '../hooks/use-careers-page-settings'

export function CareersPageSettingsForm() {
  const { data, isLoading } = useCareersPageSettings()
  const updateSettings = useUpdateCareersPageSettings()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<CareersPageSettingsModel>({
    resolver: formResolver(CareersPageSettingsSchema),
    defaultValues: getDefaultCareersPageSettings(),
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'workFields' })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateSettings.mutate(values))} className='max-w-2xl space-y-4'>
        <LanguageTabs value={lang} onValueChange={setLang} />

        <Card className='space-y-4 p-4'>
          <p className='text-sm font-medium'>Hero</p>
          {LANGUAGES.map((l) => (
            <div key={l.code} className={l.code === lang ? '' : 'hidden'}>
              <FormField
                control={form.control}
                name={`heroTitle.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title ({l.label})</FormLabel>
                    <FormControl>
                      <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          {LANGUAGES.map((l) => (
            <div key={l.code} className={l.code === lang ? '' : 'hidden'}>
              <FormField
                control={form.control}
                name={`heroDescription.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description ({l.label})</FormLabel>
                    <FormControl>
                      <Textarea dir={l.code === 'ar' ? 'rtl' : 'ltr'} rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <FormField
            control={form.control}
            name='heroImage'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hero image</FormLabel>
                <FormControl>
                  <ImageUploadField value={field.value || undefined} onChange={field.onChange} disabled={updateSettings.isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Card className='space-y-4 p-4'>
          <p className='text-sm font-medium'>Why work with us</p>
          {LANGUAGES.map((l) => (
            <div key={l.code} className={l.code === lang ? '' : 'hidden'}>
              <FormField
                control={form.control}
                name={`whyTitle.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title ({l.label})</FormLabel>
                    <FormControl>
                      <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          {LANGUAGES.map((l) => (
            <div key={l.code} className={l.code === lang ? '' : 'hidden'}>
              <FormField
                control={form.control}
                name={`whyDescription.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description ({l.label})</FormLabel>
                    <FormControl>
                      <Textarea dir={l.code === 'ar' ? 'rtl' : 'ltr'} rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <FormField
            control={form.control}
            name='whyImage'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <ImageUploadField value={field.value || undefined} onChange={field.onChange} disabled={updateSettings.isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Card className='space-y-4 p-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium'>Work fields / departments</p>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => append({ title: getDefaultMultiLanguageField(), description: getDefaultMultiLanguageField() })}
            >
              <Plus className='mr-1 h-4 w-4' /> Add
            </Button>
          </div>
          {fields.map((item, index) => (
            <div key={item.id} className='space-y-3 rounded-md border p-3'>
              <div className='flex justify-end'>
                <Button type='button' variant='ghost' size='icon' onClick={() => remove(index)}>
                  <Trash2 className='h-4 w-4 text-destructive' />
                </Button>
              </div>
              {LANGUAGES.map((l) => (
                <div key={l.code} className={l.code === lang ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : 'hidden'}>
                  <FormField
                    control={form.control}
                    name={`workFields.${index}.title.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title ({l.label})</FormLabel>
                        <FormControl>
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`workFields.${index}.description.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description ({l.label})</FormLabel>
                        <FormControl>
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          ))}
        </Card>

        <Card className='space-y-4 p-4'>
          <p className='text-sm font-medium'>Call to action</p>
          {LANGUAGES.map((l) => (
            <div key={l.code} className={l.code === lang ? '' : 'hidden'}>
              <FormField
                control={form.control}
                name={`ctaTitle.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title ({l.label})</FormLabel>
                    <FormControl>
                      <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          {LANGUAGES.map((l) => (
            <div key={l.code} className={l.code === lang ? '' : 'hidden'}>
              <FormField
                control={form.control}
                name={`ctaDescription.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description ({l.label})</FormLabel>
                    <FormControl>
                      <Textarea dir={l.code === 'ar' ? 'rtl' : 'ltr'} rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <FormField
            control={form.control}
            name='ctaImage'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <ImageUploadField value={field.value || undefined} onChange={field.onChange} disabled={updateSettings.isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='notificationEmail'
            render={({ field }) => (
              <FormItem>
                <FormLabel>New application notification email</FormLabel>
                <FormControl>
                  <Input type='email' placeholder='hr@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Button type='submit' disabled={updateSettings.isPending}>
          {updateSettings.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {updateSettings.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
