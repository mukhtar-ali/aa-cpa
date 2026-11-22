import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { AddUserToAdminPortalSchema, type AddUserToAdminPortalModel } from '@repo/shared'
import { Input } from '@/components/ui/input'
import { useCreateUser } from '../hooks/use-users'

type UserActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ open, onOpenChange }: UserActionDialogProps) {
  const createUser = useCreateUser()

  const form = useForm<AddUserToAdminPortalModel>({
    resolver: formResolver(AddUserToAdminPortalSchema),
    defaultValues: { fullName: '', email: '' },
  })

  const onSubmit = async (values: AddUserToAdminPortalModel) => {
    try {
      await createUser.mutateAsync(values)
      form.reset()
      onOpenChange(false)
    } catch {
      // Error handled by mutation hook
    }
  }

  const isLoading = createUser.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) {
          form.reset()
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new user to the admin portal. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[60vh] overflow-y-auto py-1 px-0.5'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John Doe'
                        autoComplete='name'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The user&apos;s display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='john.doe@example.com'
                        autoComplete='email'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The user&apos;s email address (used for login).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
