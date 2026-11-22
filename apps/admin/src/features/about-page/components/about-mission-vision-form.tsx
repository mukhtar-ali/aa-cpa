import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { AboutMissionVisionSchema, getAboutMissionVisionSection, type AboutMissionVisionSectionModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { useAboutMissionVision, useUpdateAboutMissionVision } from '../hooks/use-about'
import { ResponsiveImageField } from './responsive-image-field'

export function AboutMissionVisionForm() {
  const { data, isLoading } = useAboutMissionVision()
  const updateMissionVision = useUpdateAboutMissionVision()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<AboutMissionVisionSectionModel>({
    resolver: formResolver(AboutMissionVisionSchema),
    defaultValues: getAboutMissionVisionSection(),
  })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateMissionVision.mutate(values))} className='space-y-4'>
        <LanguageTabs value={lang} onValueChange={setLang} />

        {(['mission', 'vision'] as const).map((card) => (
          <Card key={card} className='space-y-4 p-4'>
            <p className='text-sm font-medium capitalize'>{card}</p>
            {LANGUAGES.map((l) => (
              <div key={l.code} className={l.code === lang ? 'space-y-3' : 'hidden'}>
                <FormField
                  control={form.control}
                  name={`${card}.title.${l.code}`}
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
                  name={`${card}.description.${l.code}`}
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
            <FormField
              control={form.control}
              name={`${card}.image`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ResponsiveImageField value={field.value} onChange={field.onChange} disabled={updateMissionVision.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        ))}

        <Button type='submit' disabled={updateMissionVision.isPending}>
          {updateMissionVision.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {updateMissionVision.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
