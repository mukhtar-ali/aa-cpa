import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  AboutCoreValuesSchema,
  getAboutCoreValuesSection,
  getDefaultAboutCoreValueItem,
  type AboutCoreValuesSectionModel,
} from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploadField } from '@/components/upload/image-upload-field'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { useAboutCoreValues, useUpdateAboutCoreValues } from '../hooks/use-about'

export function AboutCoreValuesForm() {
  const { data, isLoading } = useAboutCoreValues()
  const updateCoreValues = useUpdateAboutCoreValues()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<AboutCoreValuesSectionModel>({
    resolver: formResolver(AboutCoreValuesSchema),
    defaultValues: getAboutCoreValuesSection(),
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateCoreValues.mutate(values))} className='space-y-4'>
        <LanguageTabs value={lang} onValueChange={setLang} />

        <div className='space-y-3 rounded-md border p-3'>
          <p className='text-xs font-medium text-muted-foreground'>Section title</p>
          {LANGUAGES.map((l) => (
            <div key={l.code} className={l.code === lang ? '' : 'hidden'}>
              <FormField
                control={form.control}
                name={`title.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{l.label}</FormLabel>
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

        {fields.map((item, index) => (
          <Card key={item.id} className='space-y-4 p-4'>
            <div className='flex justify-end'>
              <Button type='button' variant='ghost' size='icon' onClick={() => remove(index)}>
                <Trash2 className='h-4 w-4 text-destructive' />
              </Button>
            </div>
            {LANGUAGES.map((l) => (
              <div key={l.code} className={l.code === lang ? 'space-y-3' : 'hidden'}>
                <FormField
                  control={form.control}
                  name={`items.${index}.title.${l.code}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.description.${l.code}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
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
              name={`items.${index}.icon`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <ImageUploadField value={field.value} onChange={field.onChange} disabled={updateCoreValues.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        ))}

        <Button type='button' variant='outline' onClick={() => append(getDefaultAboutCoreValueItem())}>
          <Plus className='mr-1 h-4 w-4' /> Add value
        </Button>

        <div>
          <Button type='submit' disabled={updateCoreValues.isPending}>
            {updateCoreValues.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {updateCoreValues.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
