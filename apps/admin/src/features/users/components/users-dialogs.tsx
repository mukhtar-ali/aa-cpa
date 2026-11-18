import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersPermissionsDialog } from './users-permissions-dialog'
import { UsersStatusDialog } from './users-status-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <UsersDeleteDialog
          key={`user-delete-${currentRow.id}`}
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          currentRow={currentRow}
        />
      )}

      {currentRow && (
        <UsersPermissionsDialog
          key={`user-permissions-${currentRow.id}`}
          open={open === 'permissions'}
          onOpenChange={() => {
            setOpen('permissions')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          currentRow={currentRow}
        />
      )}

      {currentRow && (
        <UsersStatusDialog
          key={`user-status-${currentRow.id}`}
          open={open === 'status'}
          onOpenChange={() => {
            setOpen('status')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          currentRow={currentRow}
        />
      )}
    </>
  )
}
