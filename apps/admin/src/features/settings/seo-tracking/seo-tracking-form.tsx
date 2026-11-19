import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { getDefaultGlobalSeoSettings, GlobalSeoSettingsSchema, type GlobalSeoSettingsModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { useGlobalSeo, useUpdateGlobalSeo } from '../hooks/use-global-seo'

export function SeoTrackingForm({ section = 'all' }: { section?: 'defaults' | 'tracking' | 'all' }) {
  const showDefaults = section !== 'tracking'
  const showTracking = section !== 'defaults'
  const { data, isLoading } = useGlobalSeo()
  const updateGlobalSeo = useUpdateGlobalSeo()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<GlobalSeoSettingsModel>({
    resolver: formResolver(GlobalSeoSettingsSchema),
    defaultValues: getDefaultGlobalSeoSettings(),
  })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const onSubmit = async (values: GlobalSeoSettingsModel) => {
    await updateGlobalSeo.mutateAsync(values)
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
        {showDefaults && <LanguageTabs value={lang} onValueChange={setLang} />}
        {showDefaults && (
          <>
        {LANGUAGES.map((l) => (
          <div key={l.code} className={l.code === lang ? 'space-y-4' : 'hidden'}>
            <FormField
              control={form.control}
              name={`metaTitleTemplate.${l.code}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Meta Title ({l.label})</FormLabel>
                  <FormControl>
                    <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                  </FormControl>
                  <FormDescription>
                    Used when a page doesn&apos;t set its own title.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`metaDescription.${l.code}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Meta Description ({l.label})</FormLabel>
                  <FormControl>
                    <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`keywords.${l.code}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Keywords ({l.label})</FormLabel>
                  <FormControl>
                    <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} placeholder='comma, separated, keywords' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='ogImage'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Open Graph Image</FormLabel>
                <FormControl>
                  <Input placeholder='https://...' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='canonicalBase'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Canonical Base URL</FormLabel>
                <FormControl>
                  <Input placeholder='https://example.com' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='robotsDirective'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Robots Directive</FormLabel>
                <FormControl>
                  <Input placeholder='index, follow' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

          </>
        )}

        {showTracking && (
        <div className='space-y-4 rounded-md border p-4'>
          <p className='text-sm font-medium text-muted-foreground'>Tracking</p>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='googleAnalyticsId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Analytics ID</FormLabel>
                  <FormControl>
                    <Input placeholder='G-XXXXXXXXXX' {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='googleTagManagerId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Tag Manager ID</FormLabel>
                  <FormControl>
                    <Input placeholder='GTM-XXXXXXX' {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>
                    If both are set, GTM is used and the plain Analytics tag is skipped.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        )}

        <Button type='submit' disabled={updateGlobalSeo.isPending}>
          {updateGlobalSeo.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {updateGlobalSeo.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
