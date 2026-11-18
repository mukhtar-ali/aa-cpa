import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AdminViewUserModel } from '@repo/shared'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteUser } from '../hooks/use-users'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AdminViewUserModel
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteUser = useDeleteUser()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.email) return

    try {
      await deleteUser.mutateAsync(currentRow.id)
      setValue('')
      onOpenChange(false)
    } catch {
      // Error handled by mutation hook
    }
  }

  const isLoading = deleteUser.isPending

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) {
          onOpenChange(state)
          setValue('')
        }
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.email || isLoading}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.email}</span>?
            <br />
            This action will permanently remove the user from the system. This
            cannot be undone.
          </p>

          <Label className='my-2'>
            Type the email to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={currentRow.email}
              disabled={isLoading}
              autoComplete='off'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This operation cannot be rolled back. Please be certain before
              proceeding.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={
        <>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isLoading ? 'Deleting...' : 'Delete'}
        </>
      }
      destructive
    />
  )
}
