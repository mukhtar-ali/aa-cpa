import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ForgetPasswordSchema, type ForgetPasswordModel } from '@repo/shared'
import { forgotPassword } from '@/lib/auth-api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export type ForgotPasswordFormValues = ForgetPasswordModel

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: formResolver(ForgetPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true)

    try {
      const response = await forgotPassword(data.email)

      toast.success(response.message || 'If that email exists, a code has been sent.')

      // The backend never reveals whether the email exists (see forgetPassword's generic
      // message above) — so always advance to the OTP step regardless of the response.
      await navigate({ to: '/otp', search: { email: data.email } })
    } catch (error) {
      console.error('Forgot password error:', error)

      // Show error message
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to send password reset email. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? (
            <>
              Sending email
              <Loader2 className='ml-2 h-4 w-4 animate-spin' />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className='ml-2 h-4 w-4' />
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
