import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { AboutContentSchema, getAboutContentSection, type AboutContentSectionModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { useAboutContent, useUpdateAboutContent } from '../hooks/use-about'
import { ResponsiveImageField } from './responsive-image-field'

export function AboutContentForm() {
  const { data, isLoading } = useAboutContent()
  const updateContent = useUpdateAboutContent()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<AboutContentSectionModel>({
    resolver: formResolver(AboutContentSchema),
    defaultValues: getAboutContentSection(),
  })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateContent.mutate(values))} className='space-y-4'>
        <LanguageTabs value={lang} onValueChange={setLang} />
        <Card className='space-y-4 p-4'>
          <p className='text-sm font-medium'>About content</p>
          {LANGUAGES.map((l) => (
            <div key={l.code} className={l.code === lang ? 'space-y-4' : 'hidden'}>
              <FormField
                control={form.control}
                name={`bigImageTitle.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Big image title</FormLabel>
                    <FormControl>
                      <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`smallImageTitle.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Small image title</FormLabel>
                    <FormControl>
                      <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea dir={l.code === 'ar' ? 'rtl' : 'ltr'} rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='bigImage'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Big image</FormLabel>
                  <FormControl>
                    <ResponsiveImageField value={field.value} onChange={field.onChange} disabled={updateContent.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='smallImage'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Small image</FormLabel>
                  <FormControl>
                    <ResponsiveImageField value={field.value} onChange={field.onChange} disabled={updateContent.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Button type='submit' disabled={updateContent.isPending}>
          {updateContent.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {updateContent.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
