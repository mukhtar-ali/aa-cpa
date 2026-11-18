import { UnitsActionDialog } from './units-action-dialog'
import { UnitsDeleteDialog } from './units-delete-dialog'
import { useUnitsContext } from './units-provider'

export function UnitsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUnitsContext()
  return (
    <>
      <UnitsActionDialog
        key='unit-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <UnitsActionDialog
          key={`unit-edit-${currentRow.id}`}
          open={open === 'edit'}
          onOpenChange={() => {
            setOpen('edit')
            setTimeout(() => setCurrentRow(null), 500)
          }}
          currentRow={currentRow}
        />
      )}

      {currentRow && (
        <UnitsDeleteDialog
          key={`unit-delete-${currentRow.id}`}
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
