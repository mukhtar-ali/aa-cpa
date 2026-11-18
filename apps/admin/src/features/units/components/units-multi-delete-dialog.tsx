import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UnitModel } from '@repo/shared'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteUnit } from '../hooks/use-units'

type UnitsMultiDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<UnitModel>
}

const CONFIRM_WORD = 'DELETE'

export function UnitsMultiDeleteDialog({ open, onOpenChange, table }: UnitsMultiDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteUnit = useDeleteUnit()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    await Promise.all(selectedRows.map((row) => deleteUnit.mutateAsync(row.original.id)))
    setValue('')
    table.resetRowSelection()
    onOpenChange(false)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        if (!deleteUnit.isPending) {
          onOpenChange(state)
          if (!state) setValue('')
        }
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD || deleteUnit.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='me-1 inline-block stroke-destructive' size={18} /> Delete{' '}
          {selectedRows.length} unit{selectedRows.length > 1 ? 's' : ''}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the selected units? <br />
            This action cannot be undone.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>Confirm by typing &quot;{CONFIRM_WORD}&quot;:</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              disabled={deleteUnit.isPending}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>This operation cannot be rolled back. Please be certain before proceeding.</AlertDescription>
          </Alert>
        </div>
      }
      confirmText={deleteUnit.isPending ? 'Deleting...' : 'Delete'}
      destructive
    />
  )
}
