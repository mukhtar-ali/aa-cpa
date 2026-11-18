import { InquiriesDeleteDialog } from './inquiries-delete-dialog'
import { useInquiriesContext } from './inquiries-provider'

export function InquiriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useInquiriesContext()

  return (
    <>
      {currentRow && (
        <InquiriesDeleteDialog
          key={`inquiry-delete-${currentRow.id}`}
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
