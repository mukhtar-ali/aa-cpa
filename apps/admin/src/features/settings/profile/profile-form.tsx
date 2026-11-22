import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { UpdateFullNameSchema, type UpdateFullNameModel } from '@repo/shared'
import { useAuth, useCurrentUser } from '@/context/auth-provider'
import { updateFullName } from '@/lib/auth-api'
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
import { Label } from '@/components/ui/label'

export function ProfileForm() {
  const user = useCurrentUser()
  const { refreshUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateFullNameModel>({
    resolver: formResolver(UpdateFullNameSchema),
    defaultValues: { fullName: user?.fullName ?? '' },
  })

  const onSubmit = async (values: UpdateFullNameModel) => {
    setIsSubmitting(true)
    try {
      await updateFullName(values.fullName)
      await refreshUser()
      toast.success('Name updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update name')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='space-y-8'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='fullName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder='Your full name' {...field} />
                </FormControl>
                <FormDescription>
                  This is the name shown across the admin portal and in emails sent to you.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='space-y-2'>
            <Label>Username</Label>
            <Input value={user?.username ?? ''} disabled readOnly />
            <p className='text-sm text-muted-foreground'>
              Your username. Change it from the Account page.
            </p>
          </div>

          <div className='space-y-2'>
            <Label>Email</Label>
            <Input value={user?.email ?? ''} disabled readOnly />
            <p className='text-sm text-muted-foreground'>
              Your login email. Change it from the Account page.
            </p>
          </div>

          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isSubmitting ? 'Saving...' : 'Update profile'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
