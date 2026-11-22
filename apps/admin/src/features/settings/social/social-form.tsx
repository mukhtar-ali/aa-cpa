import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { getDefaultWebsiteInfo, WebsiteInfoSectionSchema, type WebsiteInfoSectionModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useUpdateWebsiteInfo, useWebsiteInfo } from '../hooks/use-website-info'

const SOCIAL_FIELDS = [
  { name: 'facebookUrl', label: 'Facebook URL' },
  { name: 'instagramUrl', label: 'Instagram URL' },
  { name: 'linkedinUrl', label: 'LinkedIn URL' },
  { name: 'youtubeUrl', label: 'YouTube URL' },
] as const

export function SocialForm() {
  const { data, isLoading } = useWebsiteInfo()
  const updateWebsiteInfo = useUpdateWebsiteInfo()

  const form = useForm<WebsiteInfoSectionModel>({
    resolver: formResolver(WebsiteInfoSectionSchema),
    defaultValues: getDefaultWebsiteInfo(),
  })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const onSubmit = async (values: WebsiteInfoSectionModel) => {
    // Merge with the latest known state so this tab doesn't wipe out fields
    // owned by the General Info tab (same underlying section record).
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
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        {SOCIAL_FIELDS.map(({ name, label }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input placeholder='https://...' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button type='submit' disabled={updateWebsiteInfo.isPending}>
          {updateWebsiteInfo.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {updateWebsiteInfo.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
