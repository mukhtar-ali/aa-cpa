import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { JobModel } from '@repo/shared'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteJob } from '../hooks/use-jobs'

type JobsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: JobModel
}

export function JobsDeleteDialog({ open, onOpenChange, currentRow }: JobsDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteJob = useDeleteJob()
  const confirmSlug = currentRow.slug || currentRow.title?.en || currentRow.id

  const handleDelete = async () => {
    if (value.trim() !== confirmSlug) return

    try {
      await deleteJob.mutateAsync(currentRow.id)
      setValue('')
      onOpenChange(false)
    } catch {
      // Error handled by mutation hook
    }
  }

  const isLoading = deleteJob.isPending

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
      disabled={value.trim() !== confirmSlug || isLoading}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='me-1 inline-block stroke-destructive' size={18} /> Delete Job Posting
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete <span className='font-bold'>{currentRow.title?.en || confirmSlug}</span>?
            <br />
            Existing applications for this posting will be kept. This action cannot be undone.
          </p>

          <Label className='my-2'>
            Type <span className='font-mono'>{confirmSlug}</span> to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={confirmSlug}
              disabled={isLoading}
              autoComplete='off'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This operation cannot be rolled back. Please be certain before proceeding.
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
