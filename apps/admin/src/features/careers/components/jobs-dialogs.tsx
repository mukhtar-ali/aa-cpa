import { JobsActionDialog } from './jobs-action-dialog'
import { JobsDeleteDialog } from './jobs-delete-dialog'
import { useJobsContext } from './jobs-provider'

export function JobsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useJobsContext()
  return (
    <>
      <JobsActionDialog
        key='job-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <JobsActionDialog
          key={`job-edit-${currentRow.id}`}
          open={open === 'edit'}
          onOpenChange={() => {
            setOpen('edit')
            setTimeout(() => setCurrentRow(null), 500)
          }}
          currentRow={currentRow}
        />
      )}

      {currentRow && (
        <JobsDeleteDialog
          key={`job-delete-${currentRow.id}`}
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => setCurrentRow(null), 500)
          }}
          currentRow={currentRow}
        />
      )}
    </>
  )
}
