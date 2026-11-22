import { NewsActionDialog } from './news-action-dialog'
import { NewsDeleteDialog } from './news-delete-dialog'
import { useNewsContext } from './news-provider'

export function NewsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useNewsContext()
  return (
    <>
      <NewsActionDialog
        key='news-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <NewsActionDialog
          key={`news-edit-${currentRow.id}`}
          open={open === 'edit'}
          onOpenChange={() => {
            setOpen('edit')
            setTimeout(() => setCurrentRow(null), 500)
          }}
          currentRow={currentRow}
        />
      )}

      {currentRow && (
        <NewsDeleteDialog
          key={`news-delete-${currentRow.id}`}
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
