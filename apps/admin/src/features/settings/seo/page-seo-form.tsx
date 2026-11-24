import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import {
  getDefaultSeoContent,
  SeoContentSchema,
  type SeoContentModel,
} from '@repo/shared'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { SearchSnippetPreview } from '@/components/cms/search-snippet-preview'
import { useSeo, useUpdateSeo } from '../hooks/use-seo'

export const PAGE_KEYS = [
  { key: 'home', label: 'الرئيسية (Home)', slug: '' },
  { key: 'about', label: 'من نحن (About Us)', slug: 'about' },
  { key: 'services', label: 'الخدمات (Services)', slug: 'services' },
  { key: 'sectors', label: 'القطاعات (Sectors)', slug: 'sectors' },
  { key: 'articles', label: 'المقالات والبحوث (Articles)', slug: 'articles' },
  { key: 'careers', label: 'الوظائف (Careers)', slug: 'careers' },
  { key: 'contact', label: 'تواصل معنا (Contact)', slug: 'contact' },
  { key: 'privacy', label: 'سياسة الخصوصية (Privacy Policy)', slug: 'privacy' },
  { key: 'terms', label: 'الشروط والأحكام (Terms & Conditions)', slug: 'terms' },
  { key: 'accessibility', label: 'إمكانية الوصول (Accessibility)', slug: 'accessibility' },
] as const

export function PageSeoForm() {
  const [selectedPage, setSelectedPage] = useState<string>('home')
  const [lang, setLang] = useState<LanguageCode>('ar')

  const { data, isLoading } = useSeo(selectedPage)
  const updateSeoMutation = useUpdateSeo(selectedPage)

  const form = useForm<SeoContentModel>({
    resolver: formResolver(SeoContentSchema),
    defaultValues: getDefaultSeoContent(),
  })

  useEffect(() => {
    if (data) {
      form.reset(data)
    }
  }, [data, form, selectedPage])

  const onSubmit = async (values: SeoContentModel) => {
    await updateSeoMutation.mutateAsync(values)
  }

  const currentTitle = form.watch(`title.${lang}`) || ''
  const currentDesc = form.watch(`description.${lang}`) || ''
  const currentNoindex = form.watch('noindex') || false
  const currentPageObj = PAGE_KEYS.find((p) => p.key === selectedPage)

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='w-full sm:w-72'>
          <label className='text-xs font-medium text-muted-foreground mb-1 block'>
            Select Page to Configure SEO
          </label>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger>
              <SelectValue placeholder='Select page' />
            </SelectTrigger>
            <SelectContent>
              {PAGE_KEYS.map((page) => (
                <SelectItem key={page.key} value={page.key}>
                  {page.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='pt-4 sm:pt-0'>
          <LanguageTabs value={lang} onValueChange={setLang} />
        </div>
      </div>

      {isLoading ? (
        <div className='space-y-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-10 w-full' />
          ))}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Live Search Snippet Preview */}
            <SearchSnippetPreview
              title={currentTitle}
              description={currentDesc}
              slug={currentPageObj?.slug || ''}
              lang={lang}
              noindex={currentNoindex}
            />

            {/* Language-specific Fields */}
            {LANGUAGES.map((l) => (
              <div key={l.code} className={l.code === lang ? 'space-y-4' : 'hidden'}>
                <FormField
                  control={form.control}
                  name={`title.${l.code}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title ({l.label})</FormLabel>
                      <FormControl>
                        <Input
                          dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                          placeholder={l.code === 'ar' ? 'عنوان الصفحة لمحركات البحث' : 'Page Meta Title'}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ideal length is ≤ 60 characters to avoid truncation in Google results.
                      </FormDescription>
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
                        <Textarea
                          dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                          rows={3}
                          placeholder={l.code === 'ar' ? 'وصف الصفحة لمحركات البحث...' : 'Page Meta Description...'}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Recommended 120–160 characters for complete snippets without ellipsis.
                      </FormDescription>
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
                        <Input
                          dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                          placeholder='comma, separated, keywords'
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            {/* Shared SEO / Indexing options */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-md border p-4 bg-muted/20'>
              <FormField
                control={form.control}
                name='ogImage'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open Graph Image (Social Sharing)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://...'
                        {...field}
                        value={typeof field.value === 'string' ? field.value : field.value?.url ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Custom 1200×630 image. If empty, the automated brand OG generator is used.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='canonicalUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canonical URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://aacpa.sa/...'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave blank to default to standard canonical URL.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='noindex'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 sm:col-span-2 bg-card'>
                    <div className='space-y-0.5'>
                      <FormLabel>Exclude from Search (noindex)</FormLabel>
                      <FormDescription>
                        Instructs search engine crawlers not to index or display this page in results.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type='submit' disabled={updateSeoMutation.isPending}>
              {updateSeoMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {updateSeoMutation.isPending ? 'Saving...' : `Save SEO for ${currentPageObj?.key || 'Page'}`}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
