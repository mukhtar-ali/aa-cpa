import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { getDefaultHomeShowcaseSection, HomeShowcaseSchema, type HomeShowcaseSectionModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { ResponsiveImageField } from '@/features/about-page/components/responsive-image-field'
import { useHomeShowcase, useUpdateHomeShowcase } from '../hooks/use-home'

export function HomeShowcaseForm() {
  const { data, isLoading } = useHomeShowcase()
  const updateShowcase = useUpdateHomeShowcase()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<HomeShowcaseSectionModel>({
    resolver: formResolver(HomeShowcaseSchema),
    defaultValues: getDefaultHomeShowcaseSection(),
  })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateShowcase.mutate(values))} className='space-y-4'>
        <LanguageTabs value={lang} onValueChange={setLang} />
        <Card className='space-y-4 p-4'>
          <p className='text-sm font-medium'>Showcase</p>
          {LANGUAGES.map((l) => (
            <div key={l.code} className={l.code === lang ? '' : 'hidden'}>
              <FormField
                control={form.control}
                name={`description.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea dir={l.code === 'ar' ? 'rtl' : 'ltr'} rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          <div className='grid gap-4 sm:grid-cols-3'>
            <FormField
              control={form.control}
              name='leftImage'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Left image</FormLabel>
                  <FormControl>
                    <ResponsiveImageField value={field.value} onChange={field.onChange} disabled={updateShowcase.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='middleImage'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle image</FormLabel>
                  <FormControl>
                    <ResponsiveImageField value={field.value} onChange={field.onChange} disabled={updateShowcase.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='rightImage'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Right image</FormLabel>
                  <FormControl>
                    <ResponsiveImageField value={field.value} onChange={field.onChange} disabled={updateShowcase.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Button type='submit' disabled={updateShowcase.isPending}>
          {updateShowcase.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {updateShowcase.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
