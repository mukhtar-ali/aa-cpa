import { useEffect, useState } from 'react'
import { useFieldArray, useForm, useWatch, type Control } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  getDefaultHomeHeroSection,
  getDefaultHomeHeroSlide,
  HomeHeroSectionSchema,
  MediaType,
  type HomeHeroSectionModel,
} from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { LANGUAGES, LanguageTabs, type LanguageCode } from '@/components/language-tabs'
import { ResponsiveImageField } from '@/features/about-page/components/responsive-image-field'
import { useHomeHero, useUpdateHomeHero } from '../hooks/use-home'

function HeroSlideCard({
  control,
  index,
  lang,
  disabled,
  onRemove,
}: {
  control: Control<HomeHeroSectionModel>
  index: number
  lang: LanguageCode
  disabled: boolean
  onRemove: () => void
}) {
  const mediaType = useWatch({ control, name: `slides.${index}.mediaType` })

  return (
    <Card className='space-y-4 p-4'>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium'>Slide {index + 1}</p>
        <Button type='button' variant='ghost' size='icon' onClick={onRemove}>
          <Trash2 className='h-4 w-4 text-destructive' />
        </Button>
      </div>

      {LANGUAGES.map((l) => (
        <div key={l.code} className={l.code === lang ? 'space-y-3' : 'hidden'}>
          <FormField
            control={control}
            name={`slides.${index}.title.${l.code}`}
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
            control={control}
            name={`slides.${index}.subtitle.${l.code}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`slides.${index}.ctaText.${l.code}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>CTA button text</FormLabel>
                <FormControl>
                  <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}

      <FormField
        control={control}
        name={`slides.${index}.ctaLink`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>CTA button link</FormLabel>
            <FormControl>
              <Input placeholder='https://...' {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`slides.${index}.mediaType`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Media type</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={MediaType.Image}>Image</SelectItem>
                <SelectItem value={MediaType.Video}>YouTube video</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {mediaType === MediaType.Video ? (
        <FormField
          control={control}
          name={`slides.${index}.youtubeVideoId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>YouTube video ID</FormLabel>
              <FormControl>
                <Input placeholder='dQw4w9WgXcQ' {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={control}
          name={`slides.${index}.image`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ResponsiveImageField value={field.value} onChange={field.onChange} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name={`slides.${index}.isActive`}
        render={({ field }) => (
          <FormItem className='flex flex-row items-center gap-2'>
            <FormLabel className='mb-0'>Active</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </Card>
  )
}

export function HomeHeroForm() {
  const { data, isLoading } = useHomeHero()
  const updateHero = useUpdateHomeHero()
  const [lang, setLang] = useState<LanguageCode>('en')

  const form = useForm<HomeHeroSectionModel>({
    resolver: formResolver(HomeHeroSectionSchema),
    defaultValues: getDefaultHomeHeroSection(),
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'slides' })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateHero.mutate(values))} className='space-y-4'>
        <LanguageTabs value={lang} onValueChange={setLang} />

        {fields.map((item, index) => (
          <HeroSlideCard
            key={item.id}
            control={form.control}
            index={index}
            lang={lang}
            disabled={updateHero.isPending}
            onRemove={() => remove(index)}
          />
        ))}

        <Button type='button' variant='outline' onClick={() => append(getDefaultHomeHeroSlide())}>
          <Plus className='mr-1 h-4 w-4' /> Add slide
        </Button>

        <div>
          <Button type='submit' disabled={updateHero.isPending}>
            {updateHero.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {updateHero.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
