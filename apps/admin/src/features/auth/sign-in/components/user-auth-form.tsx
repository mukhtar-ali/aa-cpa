import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { LoginSchema, type LoginModel } from '@repo/shared'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { useAuthStore } from '@/stores/auth-store'
import { login } from '@/lib/auth-api'
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
import { PasswordInput } from '@/components/password-input'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { auth } = useAuthStore()
  const navigate = useNavigate()

  const form = useForm<LoginModel>({
    resolver: formResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginModel) {
    setIsLoading(true)
    setError(null)

    try {
      auth.setIsLoading(true)

      // Call real login API
      const response = await login({
        email: data.email,
        password: data.password,
      })

      // Set user and token in auth store
      auth.setUser(response.user)
      auth.setAccessToken(response.token)

      // Show welcome message
      // Sonner toast library treats content as plain text (not HTML), and email is validated by backend
      toast.success(`Welcome back, ${response.user.fullName}!`)

      // Navigate using TanStack Router — the Zustand store is already updated in memory
      // so the _authenticated route guard sees the token immediately (no cookie round-trip).
      // If redirectTo is a full URL (e.g. http://localhost:3003/path), strip origin first.
      let targetPath = redirectTo || '/'
      try {
        const url = new URL(targetPath)
        targetPath = url.pathname + url.search + url.hash
      } catch {
        // Already a relative path, use as-is
      }
      await navigate({ to: targetPath, replace: true })
    } catch (err) {
      // Handle API errors — prefer the backend's message (err.response.data.message) over
      // axios's generic "Request failed with status code ..." (err.message).
      const apiError = err as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage =
        apiError.response?.data?.message || apiError.message || 'Login failed. Please try again.'

      setError(errorMessage)
      toast.error(errorMessage)

      // Reset password field on error
      form.resetField('password')
    } finally {
      setIsLoading(false)
      auth.setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
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
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        {/* Display error message if any */}
        {error && (
          <div className='flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive'>
            <AlertCircle className='h-4 w-4' />
            <span>{error}</span>
          </div>
        )}

        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}
