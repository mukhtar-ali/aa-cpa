import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PermissionEnum, type AdminViewUserModel } from '@repo/shared'
import { useAuthStore } from '@/stores/auth-store'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { useBulkSetUserActive } from '../hooks/use-users'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const setActive = useBulkSetUserActive()
  const currentUser = useAuthStore((state) => state.auth.user)
  const permissions = currentUser?.permissions ?? []
  // Buttons only decide what to show; the API enforces the same permissions per user.
  const canDelete = permissions.includes(PermissionEnum.AdminPortalUsersDelete)
  const canActivate = permissions.includes(PermissionEnum.AdminPortalUsersActivate)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = async (isActive: boolean) => {
    const selected = selectedRows.map((row) => row.original as AdminViewUserModel)
    // The API refuses to change your own status, so leave your own row out and say so.
    const targets = selected.filter((user) => user.id !== currentUser?.id)
    if (targets.length < selected.length) {
      toast.info('Your own account was skipped: you cannot change your own status.')
    }
    if (targets.length === 0) return
    try {
      await setActive.mutateAsync({ userIds: targets.map((user) => user.id), isActive })
    } finally {
      table.resetRowSelection()
    }
  }

  if (!canDelete && !canActivate) return null

  return (
    <>
      <BulkActionsToolbar table={table} entityName='user'>
        {canActivate && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => handleBulkStatusChange(true)}
                  disabled={setActive.isPending}
                  className='size-8'
                  aria-label='Activate selected users'
                  title='Activate selected users'
                >
                  <UserCheck />
                  <span className='sr-only'>Activate selected users</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Activate selected users</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => handleBulkStatusChange(false)}
                  disabled={setActive.isPending}
                  className='size-8'
                  aria-label='Deactivate selected users'
                  title='Deactivate selected users'
                >
                  <UserX />
                  <span className='sr-only'>Deactivate selected users</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deactivate selected users</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {canDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                onClick={() => setShowDeleteConfirm(true)}
                className='size-8'
                aria-label='Delete selected users'
                title='Delete selected users'
              >
                <Trash2 />
                <span className='sr-only'>Delete selected users</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete selected users</p>
            </TooltipContent>
          </Tooltip>
        )}
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
