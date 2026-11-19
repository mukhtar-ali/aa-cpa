import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { ContactUsFormSchema, getContactFormSection, type ContactFormSectionModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { useContactPageFormSection, useUpdateContactPageFormSection } from '../hooks/use-contact-page'

export function ContactPageFormSectionForm() {
  const { data, isLoading } = useContactPageFormSection()
  const updateFormSection = useUpdateContactPageFormSection()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<ContactFormSectionModel>({
    resolver: formResolver(ContactUsFormSchema),
    defaultValues: getContactFormSection(),
  })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateFormSection.mutate(values))} className='space-y-4'>
        <LanguageTabs value={lang} onValueChange={setLang} />
        <Card className='space-y-4 p-4'>
          <p className='text-sm font-medium'>Form section</p>
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
        </Card>

        <Button type='submit' disabled={updateFormSection.isPending}>
          {updateFormSection.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {updateFormSection.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
