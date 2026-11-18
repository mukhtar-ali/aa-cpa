import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { LoginSchema, type LoginModel } from '@repo/shared'
import { useAuthStore } from '@/stores/auth-store'
import { login } from '@/lib/auth-api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
    redirectTo?: string
}

export function UserAuthForm({ className, redirectTo, ...props }: UserAuthFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { auth } = useAuthStore()
    const navigate = useNavigate()

    const form = useForm<LoginModel>({
        resolver: formResolver(LoginSchema),
        defaultValues: { email: '', password: '' },
    })

    async function onSubmit(data: LoginModel) {
        setIsLoading(true)
        setError(null)
        try {
            auth.setIsLoading(true)
            const response = await login({ email: data.email, password: data.password })
            auth.setUser(response.user)
            auth.setAccessToken(response.token)
            toast.success(`Welcome back, ${response.user.fullName}!`)
            let targetPath = redirectTo || '/'
            try {
                const url = new URL(targetPath)
                targetPath = url.pathname + url.search + url.hash
            } catch { /* relative path */ }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await navigate({ to: targetPath as any, replace: true })
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } }; message?: string }
            const msg = error?.response?.data?.message ?? error?.message ?? 'Login failed. Please try again.'
            setError(msg)
            toast.error(msg)
            form.resetField('password')
        } finally {
            setIsLoading(false)
            auth.setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-3', className)} {...props}>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="admin@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <PasswordInput placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {error && (
                    <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}
                <Button className="mt-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
                    Sign in
                </Button>
            </form>
        </Form>
    )
}
