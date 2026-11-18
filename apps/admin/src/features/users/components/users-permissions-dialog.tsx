import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { PERMISSIONS_UI, type AdminViewUserModel, type PermissionEnum } from '@repo/shared'
import { useAuthStore } from '@/stores/auth-store'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useUpdatePermissions, useUserPermissions } from '../hooks/use-users'

type UsersPermissionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AdminViewUserModel
}

export function UsersPermissionsDialog({ open, onOpenChange, currentRow }: UsersPermissionsDialogProps) {
  const user = useAuthStore((state) => state.auth.user)
  const callerPermissions = useMemo(() => new Set(user?.permissions ?? []), [user])

  const { data, isLoading, error } = useUserPermissions(currentRow.id, open)
  const updatePermissions = useUpdatePermissions()
  // Only the user's changes are kept in state (permission -> checked); everything else is derived
  // from what the server returned, so there is nothing to sync when the data loads.
  const [edits, setEdits] = useState<Map<PermissionEnum, boolean>>(new Map())

  const stored = useMemo(() => new Set(data?.permissions ?? []), [data])
  const selected = useMemo(() => {
    const next = new Set(stored)
    for (const [permission, checked] of edits) {
      if (checked) next.add(permission)
      else next.delete(permission)
    }
    return next
  }, [stored, edits])
  // The API refuses to edit a user who holds permissions the caller lacks (it could be used to
  // demote someone more powerful), so show those users read-only instead of failing on save.
  const outranked = [...stored].some((permission) => !callerPermissions.has(permission))
  const isDirty = edits.size > 0
  const isSaving = updatePermissions.isPending

  const toggle = (permission: PermissionEnum, checked: boolean) =>
    setEdits((previous) => {
      const next = new Map(previous)
      // Going back to the stored value is no longer a change.
      if (checked === stored.has(permission)) next.delete(permission)
      else next.set(permission, checked)
      return next
    })

  const handleSave = async () => {
    try {
      await updatePermissions.mutateAsync({ userId: currentRow.id, permissions: [...selected] })
      onOpenChange(false)
    } catch {
      // Error handled by the mutation hook
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isSaving) onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Permissions: {currentRow.fullName}</DialogTitle>
          <DialogDescription>
            Choose what {currentRow.email} can do. You can only grant permissions you hold yourself.
          </DialogDescription>
        </DialogHeader>

        <div className='max-h-[60vh] space-y-5 overflow-y-auto px-0.5 py-1'>
          {isLoading ? (
            <div className='space-y-3'>
              <Skeleton className='h-5 w-48' />
              <Skeleton className='h-5 w-64' />
              <Skeleton className='h-5 w-56' />
            </div>
          ) : error ? (
            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Could not load permissions</AlertTitle>
              <AlertDescription>Please close this dialog and try again.</AlertDescription>
            </Alert>
          ) : (
            <>
              {outranked && (
                <Alert>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertTitle>Read only</AlertTitle>
                  <AlertDescription>
                    This user holds permissions you don't have, so you can't change their permissions.
                  </AlertDescription>
                </Alert>
              )}
              {PERMISSIONS_UI.map((group) => (
                <fieldset key={group.group} className='space-y-2'>
                  <legend className='text-sm font-medium'>{group.displayName}</legend>
                  {group.permissions.map((permission) => {
                    const id = `perm-${currentRow.id}-${permission.key}`
                    const lacksIt = !callerPermissions.has(permission.key)
                    return (
                      <div key={permission.key} className='flex items-center gap-2'>
                        <Checkbox
                          id={id}
                          checked={selected.has(permission.key)}
                          disabled={outranked || lacksIt || isSaving}
                          onCheckedChange={(value) => toggle(permission.key, value === true)}
                        />
                        <Label htmlFor={id} className='text-sm font-normal'>
                          {permission.displayName}
                          {lacksIt && !outranked && (
                            <span className='ms-2 text-xs text-muted-foreground'>
                              (you don't have this permission)
                            </span>
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </fieldset>
              ))}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !!error || outranked || !isDirty || isSaving}>
            {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isSaving ? 'Saving...' : 'Save permissions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
