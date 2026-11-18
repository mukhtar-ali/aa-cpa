import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  AboutLeadershipSchema,
  getAboutLeadershipSection,
  getDefaultAboutLeadershipItem,
  type AboutLeadershipSectionModel,
} from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { useAboutLeadership, useUpdateAboutLeadership } from '../hooks/use-about'
import { ResponsiveImageField } from './responsive-image-field'

export function AboutLeadershipForm() {
  const { data, isLoading } = useAboutLeadership()
  const updateLeadership = useUpdateAboutLeadership()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<AboutLeadershipSectionModel>({
    resolver: formResolver(AboutLeadershipSchema),
    defaultValues: getAboutLeadershipSection(),
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateLeadership.mutate(values))} className='space-y-4'>
        <LanguageTabs value={lang} onValueChange={setLang} />

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
                  name={`items.${index}.name.${l.code}`}
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
                <FormField
                  control={form.control}
                  name={`items.${index}.jobTitle.${l.code}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job title</FormLabel>
                      <FormControl>
                        <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.bio.${l.code}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea dir={l.code === 'ar' ? 'rtl' : 'ltr'} rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <FormField
              control={form.control}
              name={`items.${index}.linkedinUrl`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input placeholder='https://linkedin.com/in/...' {...field} value={field.value ?? ''} />
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
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <ResponsiveImageField value={field.value} onChange={field.onChange} disabled={updateLeadership.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        ))}

        <Button type='button' variant='outline' onClick={() => append(getDefaultAboutLeadershipItem())}>
          <Plus className='mr-1 h-4 w-4' /> Add member
        </Button>

        <div>
          <Button type='submit' disabled={updateLeadership.isPending}>
            {updateLeadership.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {updateLeadership.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
