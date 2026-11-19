import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2, Send } from 'lucide-react'
import { getDefaultEmailSettings, EmailSettingsSchema, type EmailSettingsModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmailSettings, useSendTestEmail, useUpdateEmailSettings } from '../hooks/use-email-settings'

export function EmailSettingsForm() {
  const { data, isLoading } = useEmailSettings()
  const updateEmailSettings = useUpdateEmailSettings()
  const sendTestEmail = useSendTestEmail()
  const [testEmailTo, setTestEmailTo] = useState('')

  const form = useForm<EmailSettingsModel>({
    resolver: formResolver(EmailSettingsSchema),
    defaultValues: getDefaultEmailSettings(),
  })

  useEffect(() => {
    if (data) form.reset(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const onSubmit = async (values: EmailSettingsModel) => {
    await updateEmailSettings.mutateAsync(values)
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
    <div className='space-y-8'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='smtpHost'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Host</FormLabel>
                  <FormControl>
                    <Input placeholder='smtp.example.com' {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='smtpPort'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Port</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='587' {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='smtpUser'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Username</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='smtpPass'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Password</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>Left as-is unless you type a new value.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='smtpFromEmail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder='no-reply@example.com' {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='smtpFromName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='smtpSecure'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-2'>
                <FormLabel className='mb-0'>Use TLS/SSL</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type='submit' disabled={updateEmailSettings.isPending}>
            {updateEmailSettings.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {updateEmailSettings.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </Form>

      <div className='space-y-2 rounded-md border p-4'>
        <p className='text-sm font-medium'>Send a test email</p>
        <p className='text-sm text-muted-foreground'>
          Sends using the settings currently saved above (save first if you just changed them).
        </p>
        <div className='flex items-center gap-2'>
          <Input
            type='email'
            placeholder='you@example.com'
            value={testEmailTo}
            onChange={(e) => setTestEmailTo(e.target.value)}
            className='max-w-xs'
          />
          <Button
            type='button'
            variant='outline'
            disabled={!testEmailTo || sendTestEmail.isPending}
            onClick={() => sendTestEmail.mutate(testEmailTo)}
          >
            {sendTestEmail.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Send className='mr-2 h-4 w-4' />}
            Send test
          </Button>
        </div>
      </div>
    </div>
  )
}
