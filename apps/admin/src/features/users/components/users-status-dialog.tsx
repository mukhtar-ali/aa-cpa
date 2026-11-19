import { Loader2 } from 'lucide-react'
import type { AdminViewUserModel } from '@repo/shared'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useSetUserActive } from '../hooks/use-users'

type UsersStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AdminViewUserModel
}

export function UsersStatusDialog({ open, onOpenChange, currentRow }: UsersStatusDialogProps) {
  const setUserActive = useSetUserActive()
  const isActive = currentRow.isActive !== false
  const willActivate = !isActive

  const handleConfirm = async () => {
    try {
      await setUserActive.mutateAsync({ userId: currentRow.id, isActive: willActivate })
      onOpenChange(false)
    } catch {
      // Error handled by the mutation hook
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        if (!setUserActive.isPending) onOpenChange(state)
      }}
      handleConfirm={handleConfirm}
      disabled={setUserActive.isPending}
      title={willActivate ? 'Activate user' : 'Deactivate user'}
      desc={
        willActivate
          ? `${currentRow.fullName} will be able to sign in again.`
          : `${currentRow.fullName} will be signed out everywhere and will not be able to sign in until you activate the account again.`
      }
      confirmText={
        <>
          {setUserActive.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {willActivate ? 'Activate' : 'Deactivate'}
        </>
      }
      destructive={!willActivate}
    />
  )
}
