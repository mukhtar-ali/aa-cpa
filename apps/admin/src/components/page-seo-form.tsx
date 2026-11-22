import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { getDefaultSeoContent, SeoContentSchema, type SeoContentModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { useSeo, useUpdateSeo } from '@/features/settings/hooks/use-seo'

/** Per-page SEO block, stored under `pageKey`. Empty fields fall back to Settings → SEO Settings (site defaults). */
export function PageSeoForm({ pageKey }: { pageKey: string }) {
  const [lang, setLang] = useState<LanguageCode>('en')
  const { data, isLoading } = useSeo(pageKey)
  const updateSeo = useUpdateSeo(pageKey)

  const form = useForm<SeoContentModel>({
    resolver: formResolver(SeoContentSchema),
    defaultValues: getDefaultSeoContent(),
  })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const onSubmit = async (values: SeoContentModel) => {
    await updateSeo.mutateAsync(values)
  }

  return (
    <div className='space-y-6'>
      <p className='text-sm text-muted-foreground'>
        Leave a field empty to use the site-wide default from Settings → SEO Settings.
      </p>

      {isLoading ? (
        <div className='space-y-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-10 w-full' />
          ))}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <LanguageTabs value={lang} onValueChange={setLang} />
            <Card className='space-y-4 p-4'>
              <p className='text-sm font-medium'>Search appearance</p>
              {LANGUAGES.map((l) => (
                <div key={l.code} className={l.code === lang ? 'space-y-4' : 'hidden'}>
                  <FormField
                    control={form.control}
                    name={`title.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title ({l.label})</FormLabel>
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
                        <FormLabel>Meta Description ({l.label})</FormLabel>
                        <FormControl>
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} value={field.value ?? ''} />
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
                        <FormLabel>Keywords ({l.label})</FormLabel>
                        <FormControl>
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </Card>

            <Card className='space-y-4 p-4'>
              <p className='text-sm font-medium'>Sharing</p>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='canonicalUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canonical URL</FormLabel>
                      <FormControl>
                        <Input placeholder='https://...' {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='ogImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Open Graph Image</FormLabel>
                      <FormControl>
                        <Input placeholder='https://...' {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Button type='submit' disabled={updateSeo.isPending}>
              {updateSeo.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {updateSeo.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
