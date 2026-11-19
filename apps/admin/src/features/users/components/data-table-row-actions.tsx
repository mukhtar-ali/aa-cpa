import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PermissionEnum, type AdminViewUserModel } from '@repo/shared'
import { useAuthStore } from '@/stores/auth-store'
import { useUsers } from './users-provider'

type DataTableRowActionsProps = {
  row: Row<AdminViewUserModel>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers()
  const currentUser = useAuthStore((state) => state.auth.user)
  const permissions = currentUser?.permissions ?? []
  // These only decide what to SHOW; the API enforces the same rules (permission, not yourself,
  // and only users whose permissions are a subset of yours).
  const isSelf = currentUser?.id === row.original.id
  const canEditPermissions = !isSelf && permissions.includes(PermissionEnum.PermissionsUpdate)
  const canToggleActive = !isSelf && permissions.includes(PermissionEnum.AdminPortalUsersActivate)
  const isActive = row.original.isActive !== false

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          aria-label='Open user actions menu'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[200px]'>
        {canEditPermissions && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('permissions')
            }}
          >
            Edit permissions
            <DropdownMenuShortcut>
              <ShieldCheck size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {canToggleActive && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('status')
            }}
          >
            {isActive ? 'Deactivate' : 'Activate'}
            <DropdownMenuShortcut>
              {isActive ? <UserX size={16} /> : <UserCheck size={16} />}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('delete')
          }}
          className='text-destructive!'
        >
          Delete
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
