import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ContactModel } from '@repo/shared'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteContactSubmission } from '../hooks/use-contact-submissions'

export function ContactSubmissionsRowActions({ contact }: { contact: ContactModel }) {
  const deleteSubmission = useDeleteContactSubmission()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant='ghost' size='icon' onClick={() => setOpen(true)} aria-label='Delete submission'>
        <Trash2 className='h-4 w-4 text-destructive' />
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={(state) => {
          if (!deleteSubmission.isPending) setOpen(state)
        }}
        handleConfirm={async () => {
          await deleteSubmission.mutateAsync(contact.id)
          setOpen(false)
        }}
        title={<span className='text-destructive'>Delete Submission</span>}
        desc={`Delete the message from ${contact.fullName}? This action cannot be undone.`}
        confirmText={
          <>
            {deleteSubmission.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {deleteSubmission.isPending ? 'Deleting...' : 'Delete'}
          </>
        }
        isLoading={deleteSubmission.isPending}
        destructive
      />
    </>
  )
}
