import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { ContactUsHeroSchema, getContactHeroSection, type ContactHeroSectionModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ImageUploadField } from '@/components/upload/image-upload-field'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { useContactPageHero, useUpdateContactPageHero } from '../hooks/use-contact-page'

export function ContactPageHeroForm() {
  const { data, isLoading } = useContactPageHero()
  const updateHero = useUpdateContactPageHero()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<ContactHeroSectionModel>({
    resolver: formResolver(ContactUsHeroSchema),
    defaultValues: getContactHeroSection(),
  })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateHero.mutate(values))} className='space-y-4'>
        <LanguageTabs value={lang} onValueChange={setLang} />
        <Card className='space-y-4 p-4'>
          <p className='text-sm font-medium'>Hero</p>
          {LANGUAGES.map((l) => (
            <div key={l.code} className={l.code === lang ? 'space-y-4' : 'hidden'}>
              <FormField
                control={form.control}
                name={`title.${l.code}`}
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
                name={`subtitle.${l.code}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
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
            name='backgroundImage'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background image</FormLabel>
                <FormControl>
                  <ImageUploadField
                    value={field.value?.desktop || undefined}
                    onChange={(url) => field.onChange({ desktop: url, tablet: url, mobile: url })}
                    disabled={updateHero.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Button type='submit' disabled={updateHero.isPending}>
          {updateHero.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {updateHero.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
