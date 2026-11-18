import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { JobModel } from '@repo/shared'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteJob } from '../hooks/use-jobs'

type JobsMultiDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<JobModel>
}

const CONFIRM_WORD = 'DELETE'

export function JobsMultiDeleteDialog({ open, onOpenChange, table }: JobsMultiDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteJob = useDeleteJob()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    await Promise.all(selectedRows.map((row) => deleteJob.mutateAsync(row.original.id)))
    setValue('')
    table.resetRowSelection()
    onOpenChange(false)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        if (!deleteJob.isPending) {
          onOpenChange(state)
          if (!state) setValue('')
        }
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD || deleteJob.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='me-1 inline-block stroke-destructive' size={18} /> Delete{' '}
          {selectedRows.length} job posting{selectedRows.length > 1 ? 's' : ''}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the selected job postings? <br />
            Existing applications for these postings will be kept. This action cannot be undone.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>Confirm by typing &quot;{CONFIRM_WORD}&quot;:</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              disabled={deleteJob.isPending}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>This operation cannot be rolled back. Please be certain before proceeding.</AlertDescription>
          </Alert>
        </div>
      }
      confirmText={deleteJob.isPending ? 'Deleting...' : 'Delete'}
      destructive
    />
  )
}
