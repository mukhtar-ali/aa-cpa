import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { getDefaultHomeAboutTeaserSection, HomeAboutTeaserSchema, type HomeAboutTeaserSectionModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { ResponsiveImageField } from '@/features/about-page/components/responsive-image-field'
import { useHomeAboutTeaser, useUpdateHomeAboutTeaser } from '../hooks/use-home'

export function HomeAboutTeaserForm() {
  const { data, isLoading } = useHomeAboutTeaser()
  const updateTeaser = useUpdateHomeAboutTeaser()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<HomeAboutTeaserSectionModel>({
    resolver: formResolver(HomeAboutTeaserSchema),
    defaultValues: getDefaultHomeAboutTeaserSection(),
  })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateTeaser.mutate(values))} className='space-y-4'>
        <LanguageTabs value={lang} onValueChange={setLang} />
        <Card className='space-y-4 p-4'>
          <p className='text-sm font-medium'>About teaser</p>
          {LANGUAGES.map((l) => (
            <div key={l.code} className={l.code === lang ? 'space-y-4' : 'hidden'}>
              <FormField
                control={form.control}
                name={`text.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Textarea dir={l.code === 'ar' ? 'rtl' : 'ltr'} rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`anchorLabel.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anchor button label</FormLabel>
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
            name='anchorUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anchor button URL</FormLabel>
                <FormControl>
                  <Input placeholder='https://...' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='image'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <ResponsiveImageField value={field.value} onChange={field.onChange} disabled={updateTeaser.isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Button type='submit' disabled={updateTeaser.isPending}>
          {updateTeaser.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {updateTeaser.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
