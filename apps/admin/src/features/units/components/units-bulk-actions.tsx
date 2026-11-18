import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { UnitModel } from '@repo/shared'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { UnitsMultiDeleteDialog } from './units-multi-delete-dialog'

type UnitsBulkActionsProps = {
  table: Table<UnitModel>
}

export function UnitsBulkActions({ table }: UnitsBulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <BulkActionsToolbar table={table} entityName='unit'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected units'
              title='Delete selected units'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected units</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected units</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UnitsMultiDeleteDialog table={table} open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} />
    </>
  )
}
