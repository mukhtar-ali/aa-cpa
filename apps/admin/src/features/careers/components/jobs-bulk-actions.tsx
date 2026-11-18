import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { JobModel } from '@repo/shared'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { JobsMultiDeleteDialog } from './jobs-multi-delete-dialog'

type JobsBulkActionsProps = {
  table: Table<JobModel>
}

export function JobsBulkActions({ table }: JobsBulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <BulkActionsToolbar table={table} entityName='job posting'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected job postings'
              title='Delete selected job postings'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected job postings</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected job postings</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <JobsMultiDeleteDialog table={table} open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} />
    </>
  )
}
