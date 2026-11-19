import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { getDefaultWebsiteInfo, WebsiteInfoSectionSchema, type WebsiteInfoSectionModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { useUpdateWebsiteInfo, useWebsiteInfo } from '../hooks/use-website-info'

export function GeneralForm() {
  const { data, isLoading } = useWebsiteInfo()
  const updateWebsiteInfo = useUpdateWebsiteInfo()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<WebsiteInfoSectionModel>({
    resolver: formResolver(WebsiteInfoSectionSchema),
    defaultValues: getDefaultWebsiteInfo(),
  })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const onSubmit = async (values: WebsiteInfoSectionModel) => {
    // The section is stored as one JSON blob — merge with the latest known
    // state so this tab doesn't wipe out fields owned by the Social tab.
    await updateWebsiteInfo.mutateAsync({ ...data, ...values })
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-full' />
        ))}
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type='email' placeholder='info@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder='+20 000 000 0000' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='whatsapp'
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder='+20 000 000 0000' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Map Link</FormLabel>
                <FormControl>
                  <Input placeholder='https://maps.google.com/...' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='logoUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl>
                  <Input placeholder='https://...' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='faviconUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Favicon URL</FormLabel>
                <FormControl>
                  <Input placeholder='https://...' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='rounded-md border p-4'>
          <FormField
            control={form.control}
            name='mapEmbed'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Map Embed (iframe HTML)</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder='<iframe src="..."></iframe>' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <LanguageTabs value={lang} onValueChange={setLang} />
        {LANGUAGES.map((l) => (
          <div key={l.code} className={l.code === lang ? 'space-y-4' : 'hidden'}>
            <FormField
              control={form.control}
              name={`siteName.${l.code}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name ({l.label})</FormLabel>
                  <FormControl>
                    <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`tagline.${l.code}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline ({l.label})</FormLabel>
                  <FormControl>
                    <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`businessHours.${l.code}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Hours ({l.label})</FormLabel>
                  <FormControl>
                    <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} placeholder='Sun–Thu, 9am–5pm' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`address.${l.code}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address ({l.label})</FormLabel>
                  <FormControl>
                    <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`footerDescription.${l.code}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Footer Description ({l.label})</FormLabel>
                  <FormControl>
                    <Textarea dir={l.code === 'ar' ? 'rtl' : 'ltr'} rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        <Button type='submit' disabled={updateWebsiteInfo.isPending}>
          {updateWebsiteInfo.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {updateWebsiteInfo.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
