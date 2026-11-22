import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  AboutPartnersSchema,
  getAboutPartnersSection,
  getDefaultAboutPartnerItem,
  type AboutPartnersSectionModel,
} from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ImageUploadField } from '@/components/upload/image-upload-field'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { useAboutPartners, useUpdateAboutPartners } from '../hooks/use-about'

export function AboutPartnersForm() {
  const { data, isLoading } = useAboutPartners()
  const updatePartners = useUpdateAboutPartners()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<AboutPartnersSectionModel>({
    resolver: formResolver(AboutPartnersSchema),
    defaultValues: getAboutPartnersSection(),
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updatePartners.mutate(values))} className='space-y-4'>
        <LanguageTabs value={lang} onValueChange={setLang} />

        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
          {fields.map((item, index) => (
            <Card key={item.id} className='space-y-3 p-4'>
              <div className='flex justify-end'>
                <Button type='button' variant='ghost' size='icon' onClick={() => remove(index)}>
                  <Trash2 className='h-4 w-4 text-destructive' />
                </Button>
              </div>
              {LANGUAGES.map((l) => (
                <div key={l.code} className={l.code === lang ? '' : 'hidden'}>
                  <FormField
                    control={form.control}
                    name={`items.${index}.title.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <FormField
                control={form.control}
                name={`items.${index}.websiteUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder='https://...' {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.image`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <ImageUploadField value={field.value} onChange={field.onChange} disabled={updatePartners.isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          ))}
        </div>

        <Button type='button' variant='outline' onClick={() => append(getDefaultAboutPartnerItem())}>
          <Plus className='mr-1 h-4 w-4' /> Add partner
        </Button>

        <div>
          <Button type='submit' disabled={updatePartners.isPending}>
            {updatePartners.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {updatePartners.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
