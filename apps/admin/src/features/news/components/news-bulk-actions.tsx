import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { NewsModel } from '@repo/shared'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { NewsMultiDeleteDialog } from './news-multi-delete-dialog'

type NewsBulkActionsProps = {
  table: Table<NewsModel>
}

export function NewsBulkActions({ table }: NewsBulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <BulkActionsToolbar table={table} entityName='article'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected articles'
              title='Delete selected articles'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected articles</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected articles</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <NewsMultiDeleteDialog table={table} open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} />
    </>
  )
}
