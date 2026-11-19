import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
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
import { getAdminArticleCategories, getAdminAuthors } from '@/lib/reference-api'
import { useCreateNews, useUpdateNews } from '../hooks/use-news'

type NewsActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: NewsModel | null
}

function toFormValues(news?: NewsModel | null): NewsFormModel {
  if (!news) return getDefaultNewsForm()
  const anyNews = news as any
  return {
    title: news.title,
    excerpt: news.excerpt,
    body: news.body,
    metaTitle: news.metaTitle,
    metaDescription: news.metaDescription,
    keywords: news.keywords,
    thumbnail: typeof news.thumbnail === 'string' ? news.thumbnail : (anyNews.thumbnail?.url ?? ''),
    categoryId: anyNews.categoryId ?? undefined,
    authorId: anyNews.authorId ?? undefined,
    readingMinutes: anyNews.readingMinutes ?? undefined,
    tocEnabled: anyNews.tocEnabled ?? true,
    publishedAt: anyNews.publishedAt ?? undefined,
    tags: anyNews.tags ?? [],
    sectorIds: anyNews.sectorIds ?? [],
    serviceIds: anyNews.serviceIds ?? [],
    tag: news.tag ?? 'news',
    isPublished: news.isPublished,
    isFeatured: news.isFeatured,
    slug: news.slug,
  }
}

export function NewsActionDialog({ open, onOpenChange, currentRow }: NewsActionDialogProps) {
  const isEdit = !!currentRow
  const createNews = useCreateNews()
  const updateNews = useUpdateNews()
  const [lang, setLang] = useState<'en' | 'ar'>('ar')

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-article-categories'],
    queryFn: getAdminArticleCategories,
    enabled: open,
  })

  const { data: authors = [] } = useQuery({
    queryKey: ['admin-authors'],
    queryFn: getAdminAuthors,
    enabled: open,
  })

  const form = useForm<NewsFormModel>({
    resolver: formResolver(NewsFormSchema),
    defaultValues: toFormValues(currentRow),
  })

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(currentRow))
      setLang('ar')
    }
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
          <DialogTitle>{isEdit ? 'Edit Article' : 'Add Article'}</DialogTitle>
          <DialogDescription>
            Manage bilingual CPA articles, categories, authors, and SEO metadata.
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
                        <FormLabel>
                          Title ({l.label}) {l.code === 'ar' && <span className='text-destructive'>*</span>}
                        </FormLabel>
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
                        <Input placeholder='auto-generated from title' {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='categoryId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name?.ar || cat.name?.en || cat.slug}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='authorId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select author' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {authors.map((auth) => (
                            <SelectItem key={auth.id} value={auth.id}>
                              {auth.name?.ar || auth.name?.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='readingMinutes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reading Minutes (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={1}
                          placeholder='Auto-calculated if empty'
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='thumbnail'
                render={({ field }) => {
                  const thumbUrl = typeof field.value === 'string' ? field.value : (field.value?.url ?? '')
                  return (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <ImageUploadField
                          value={thumbUrl || undefined}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <div className='flex flex-wrap items-center gap-8'>
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
                <FormField
                  control={form.control}
                  name='tocEnabled'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center gap-2'>
                      <FormLabel className='mb-0'>Table of Contents</FormLabel>
                      <FormControl>
                        <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
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
