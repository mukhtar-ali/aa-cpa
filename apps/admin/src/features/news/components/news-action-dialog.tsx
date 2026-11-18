import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { getDefaultNewsForm, NewsFormSchema, type NewsFormModel, type NewsModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploadField } from '@/components/upload/image-upload-field'
import { RichTextEditor } from '@/components/rich-text/rich-text-editor'
import { LANGUAGES, LanguageTabs } from '@/components/language-tabs'
import { useCreateNews, useUpdateNews } from '../hooks/use-news'

type NewsActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: NewsModel | null
}

function toFormValues(news?: NewsModel | null): NewsFormModel {
  if (!news) return getDefaultNewsForm()
  return {
    title: news.title,
    excerpt: news.excerpt,
    body: news.body,
    metaTitle: news.metaTitle,
    metaDescription: news.metaDescription,
    keywords: news.keywords,
    thumbnail: news.thumbnail ?? '',
    tag: news.tag,
    isPublished: news.isPublished,
    isFeatured: news.isFeatured,
    slug: news.slug,
  }
}

export function NewsActionDialog({ open, onOpenChange, currentRow }: NewsActionDialogProps) {
  const isEdit = !!currentRow
  const createNews = useCreateNews()
  const updateNews = useUpdateNews()
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  const form = useForm<NewsFormModel>({
    resolver: formResolver(NewsFormSchema),
    defaultValues: toFormValues(currentRow),
  })

  useEffect(() => {
    if (open) form.reset(toFormValues(currentRow))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRow])

  const onSubmit = async (values: NewsFormModel) => {
    try {
      if (isEdit && currentRow) {
        await updateNews.mutateAsync({ id: currentRow.id, data: values })
      } else {
        await createNews.mutateAsync(values)
      }
      onOpenChange(false)
    } catch {
      // Error handled by mutation hook
    }
  }

  const isLoading = createNews.isPending || updateNews.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Article' : 'Add News Article'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the article below. Content fields support English and Arabic.'
              : 'Create a new news/event article. Content fields support English and Arabic.'}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto px-0.5 py-1'>
          <Form {...form}>
            <form id='news-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <LanguageTabs value={lang} onValueChange={setLang} />

              {LANGUAGES.map((l) => (
                <div key={l.code} className={l.code === lang ? 'space-y-4' : 'hidden'}>
                  <FormField
                    control={form.control}
                    name={`title.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title ({l.label})</FormLabel>
                        <FormControl>
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} placeholder='Article title' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`excerpt.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt ({l.label})</FormLabel>
                        <FormControl>
                          <Textarea
                            dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                            rows={2}
                            placeholder='Short summary shown on listing pages'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`body.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body ({l.label})</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            language={l.code}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='rounded-md border p-3'>
                    <p className='mb-2 text-xs font-medium text-muted-foreground'>SEO ({l.label})</p>
                    <div className='space-y-3'>
                      <FormField
                        control={form.control}
                        name={`metaTitle.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta title</FormLabel>
                            <FormControl>
                              <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`metaDescription.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta description</FormLabel>
                            <FormControl>
                              <Textarea dir={l.code === 'ar' ? 'rtl' : 'ltr'} rows={2} {...field} />
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
                            <FormLabel>Keywords</FormLabel>
                            <FormControl>
                              <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} placeholder='comma, separated' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder='auto-generated from EN title' {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='tag'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='news'>News</SelectItem>
                          <SelectItem value='event'>Event</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='thumbnail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <ImageUploadField
                        value={field.value ?? undefined}
                        onChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex items-center gap-8'>
                <FormField
                  control={form.control}
                  name='isPublished'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center gap-2'>
                      <FormLabel className='mb-0'>Published</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='isFeatured'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center gap-2'>
                      <FormLabel className='mb-0'>Featured</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='news-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
