import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  ChangeEmailSchema,
  ChangePasswordSchema,
  ChangeUsernameSchema,
  type ChangeEmailModel,
  type ChangePasswordModel,
  type ChangeUsernameModel,
} from '@repo/shared'
import { useAuth } from '@/context/auth-provider'
import { changeEmail, changePassword, changeUsername } from '@/lib/auth-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

function ChangeUsernameCard() {
  const { refreshUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<ChangeUsernameModel>({
    resolver: formResolver(ChangeUsernameSchema),
    defaultValues: { newUsername: '', password: '' },
  })

  const onSubmit = async (values: ChangeUsernameModel) => {
    setIsSubmitting(true)
    try {
      await changeUsername(values)
      await refreshUser()
      form.reset({ newUsername: values.newUsername, password: '' })
      toast.success('Username updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update username')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Username</CardTitle>
        <CardDescription>Change the username you sign in with.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='newUsername'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New username</FormLabel>
                  <FormControl>
                    <Input autoComplete='username' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input type='password' autoComplete='current-password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isSubmitting ? 'Saving...' : 'Update username'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function ChangeEmailCard() {
  const { refreshUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<ChangeEmailModel>({
    resolver: formResolver(ChangeEmailSchema),
    defaultValues: { newEmail: '', password: '' },
  })

  const onSubmit = async (values: ChangeEmailModel) => {
    setIsSubmitting(true)
    try {
      await changeEmail(values)
      await refreshUser()
      form.reset({ newEmail: values.newEmail, password: '' })
      toast.success('Email updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update email')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email</CardTitle>
        <CardDescription>Change the email address you sign in with.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='newEmail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New email</FormLabel>
                  <FormControl>
                    <Input type='email' autoComplete='email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input type='password' autoComplete='current-password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isSubmitting ? 'Saving...' : 'Update email'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function ChangePasswordCard() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<ChangePasswordModel>({
    resolver: formResolver(ChangePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', passwordConfirmation: '' },
  })

  const onSubmit = async (values: ChangePasswordModel) => {
    setIsSubmitting(true)
    try {
      await changePassword(values)
      toast.success('Password changed. Please sign in again.')
      auth.reset()
      navigate({ to: '/sign-in', replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Change your password. You&apos;ll be signed out of all devices and need to sign in again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='oldPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input type='password' autoComplete='current-password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type='password' autoComplete='new-password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='passwordConfirmation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input type='password' autoComplete='new-password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isSubmitting ? 'Saving...' : 'Change password'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export function AccountForm() {
  return (
    <div className='space-y-6'>
      <ChangeUsernameCard />
      <ChangeEmailCard />
      <ChangePasswordCard />
    </div>
  )
}
