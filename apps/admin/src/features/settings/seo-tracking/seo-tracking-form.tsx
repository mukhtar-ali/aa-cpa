import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { getDefaultGlobalSeoSettings, GlobalSeoSettingsSchema, type GlobalSeoSettingsModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { SearchSnippetPreview } from '@/components/cms/search-snippet-preview'
import { BilingualField } from '@/components/cms/BilingualField'
import { useGlobalSeo, useUpdateGlobalSeo } from '../hooks/use-global-seo'

const CONSENT_TEXT_FIELDS = [
  { key: 'bannerTitle', label: 'Banner title', multiline: false },
  { key: 'bannerDescription', label: 'Banner description', multiline: true },
  { key: 'acceptAllLabel', label: 'Accept all button', multiline: false },
  { key: 'rejectAllLabel', label: 'Reject non-essential button', multiline: false },
  { key: 'customizeLabel', label: 'Preferences button', multiline: false },
  { key: 'analyticsDescription', label: 'Analytics category description', multiline: true },
  { key: 'marketingDescription', label: 'Marketing category description', multiline: true },
] as const

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

  const currentTitle = form.watch(`metaTitleTemplate.${lang}`) || ''
  const currentDesc = form.watch(`metaDescription.${lang}`) || ''

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {showDefaults && (
          <SearchSnippetPreview
            title={currentTitle}
            description={currentDesc}
            slug=''
            lang={lang}
          />
        )}
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
          <p className='text-sm font-medium text-muted-foreground'>Tracking & Analytics</p>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='googleAnalyticsId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Analytics 4 ID (GA4)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='G-XXXXXXXXXX'
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        field.onChange(e)
                        form.setValue('gaMeasurementId', e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>Format: G-XXXXXXXXXX</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='googleTagManagerId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Tag Manager ID (GTM)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='GTM-XXXXXXX'
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        field.onChange(e)
                        form.setValue('gtmId', e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Format: GTM-XXXXXXX
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='metaPixelId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta (Facebook) Pixel ID</FormLabel>
                  <FormControl>
                    <Input placeholder='Numeric ID e.g. 123456789012345' {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>Loads only after user grants Marketing consent.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='consentVersion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consent Policy Version</FormLabel>
                  <FormControl>
                    <Input placeholder='1.0' {...field} value={field.value ?? '1.0'} />
                  </FormControl>
                  <FormDescription>
                    Bumping this version (e.g. 1.0 → 1.1) prompts all visitors for consent again.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        )}

        {showTracking && (
          <div className='space-y-4 rounded-lg border p-4'>
            <div>
              <h3 className='text-lg font-semibold'>Cookie banner texts (optional)</h3>
              <p className='text-muted-foreground text-sm'>
                Leave a field empty to use the built-in Arabic/English wording. Have the legal advisor approve any change, then bump the consent version above.
              </p>
            </div>
            {CONSENT_TEXT_FIELDS.map(({ key, label, multiline }) => (
              <Controller
                key={key}
                control={form.control}
                name={`consentTexts.${key}`}
                render={({ field }) => (
                  <BilingualField
                    label={label}
                    namePrefix={`consent-${key}`}
                    multiline={multiline}
                    value={(field.value as { ar: string; en: string } | undefined) ?? { ar: '', en: '' }}
                    onChange={field.onChange}
                    placeholderAr='اتركه فارغاً لاستخدام النص الافتراضي'
                    placeholderEn='Leave empty to use the default text'
                  />
                )}
              />
            ))}
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
