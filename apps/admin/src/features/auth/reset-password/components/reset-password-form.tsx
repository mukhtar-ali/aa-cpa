import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ResetPasswordSchema, type ResetPasswordModel } from '@repo/shared'
import { getCurrentUser, resetPassword } from '@/lib/auth-api'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
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

export function ResetPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/(auth)/reset-password' })
  const { auth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const email = search.email
  const otp = search.otp
  const hasLinkParams = !!email && !!otp

  const form = useForm<ResetPasswordModel>({
    resolver: formResolver(ResetPasswordSchema),
    defaultValues: {
      email: email ?? '',
      otp: otp ?? '',
      newPassword: '',
      passwordConfirmation: '',
    },
  })

  async function onSubmit(data: ResetPasswordModel) {
    if (!hasLinkParams) {
      toast.error('Invalid or missing reset link. Please request a new one.')
      return
    }

    setIsLoading(true)

    try {
      const response = await resetPassword({ ...data, email, otp })

      toast.success(response.message || 'Password reset successfully')

      // The API logs the user in as part of resetting the password (returns a fresh
      // token) — use it so they land on the dashboard already signed in.
      auth.setAccessToken(response.token)
      const user = await getCurrentUser()
      auth.setUser(user)

      form.reset()

      setTimeout(() => {
        navigate({ to: '/', replace: true })
      }, 1500)
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string }
      const message =
        apiError.response?.data?.message ??
        apiError.message ??
        'Failed to reset password. Please try again or request a new reset link.'

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        {!hasLinkParams && (
          <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
            Invalid or missing reset link. Please request a new password reset link.
          </div>
        )}

        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='••••••••'
                  autoComplete='new-password'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1
                special character.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='passwordConfirmation'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='••••••••'
                  autoComplete='new-password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full' disabled={isLoading || !hasLinkParams}>
          {isLoading ? (
            <>
              Resetting password
              <Loader2 className='ml-2 h-4 w-4 animate-spin' />
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </Form>
  )
}
