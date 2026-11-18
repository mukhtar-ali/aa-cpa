import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CanResetPasswordSchema, type CanResetPasswordModel } from '@repo/shared'
import { canResetPassword } from '@/lib/auth-api'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'

const formSchema = CanResetPasswordSchema.pick({ otp: true })
type OtpFormValues = Pick<CanResetPasswordModel, 'otp'>

type OtpFormProps = React.HTMLAttributes<HTMLFormElement>

export function OtpForm({ className, ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/(auth)/otp' })
  const email = search.email
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<OtpFormValues>({
    resolver: formResolver(formSchema),
    defaultValues: { otp: '' },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const otp = form.watch('otp')

  async function onSubmit(data: OtpFormValues) {
    if (!email) {
      toast.error('Missing email — please start over from Forgot Password.')
      await navigate({ to: '/forgot-password' })
      return
    }

    setIsLoading(true)
    try {
      const valid = await canResetPassword({ email, otp: data.otp })
      if (!valid) {
        toast.error('Invalid or expired code. Please try again.')
        form.resetField('otp')
        return
      }

      await navigate({ to: '/reset-password', search: { email, otp: data.otp } })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify code. Please try again.')
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
        {!email && (
          <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
            No email on this link. Please request a new code from the Forgot Password page.
          </div>
        )}
        <FormField
          control={form.control}
          name='otp'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={otp.length < 6 || isLoading || !email}>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Verify
        </Button>
      </form>
    </Form>
  )
}
