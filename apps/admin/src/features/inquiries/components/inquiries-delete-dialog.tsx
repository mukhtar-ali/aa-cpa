import { AlertTriangle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { InquiryModel } from '@repo/shared'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteInquiry } from '../hooks/use-inquiries'

type InquiriesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: InquiryModel
}

export function InquiriesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: InquiriesDeleteDialogProps) {
  const deleteInquiry = useDeleteInquiry()

  const handleDelete = async () => {
    try {
      await deleteInquiry.mutateAsync(currentRow.id)
      onOpenChange(false)
    } catch {
      // Error handled by mutation hook
    }
  }

  const isLoading = deleteInquiry.isPending

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) onOpenChange(state)
      }}
      handleConfirm={handleDelete}
      disabled={isLoading}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete Inquiry
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Are you sure you want to delete the inquiry from{' '}
            <span className='font-bold'>{currentRow.fullName}</span>?
            <br />
            This action cannot be undone.
          </p>
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
