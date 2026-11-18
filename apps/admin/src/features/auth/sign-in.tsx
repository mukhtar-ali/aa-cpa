import { useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthLayout } from './auth-layout'
import { UserAuthForm } from './user-auth-form'

export function SignIn() {
    const search = useSearch({ strict: false }) as { redirect?: string }
    return (
        <AuthLayout>
            <Card className='max-w-sm gap-4'>
                <CardHeader>
                    <CardTitle className="text-lg tracking-tight">Sign in</CardTitle>
                    <CardDescription>Enter your email and password to access the admin panel</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserAuthForm redirectTo={search.redirect} />
                </CardContent>
            </Card>
        </AuthLayout>
    )
}
