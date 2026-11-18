import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ContactModel } from '@repo/shared'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { ContactSubmissionsMultiDeleteDialog } from './contact-submissions-multi-delete-dialog'

type ContactSubmissionsBulkActionsProps = {
  table: Table<ContactModel>
}

export function ContactSubmissionsBulkActions({ table }: ContactSubmissionsBulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <BulkActionsToolbar table={table} entityName='submission'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected submissions'
              title='Delete selected submissions'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected submissions</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected submissions</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ContactSubmissionsMultiDeleteDialog table={table} open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} />
    </>
  )
}
