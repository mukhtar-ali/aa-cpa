import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AddUserToAdminPortalModel, UpdatePermissionsModel } from '@repo/shared'
import {
  getUsers,
  createUser,
  deleteUser,
  getUserPermissions,
  setUserActive,
  updatePermissions,
} from '@/lib/users-api'
import { toast } from 'sonner'

export function useUsers(page: number = 1, pageSize: number = 10, search?: string) {
  return useQuery({
    queryKey: ['users', page, pageSize, search],
    queryFn: () => getUsers({ pageNumber: page, pageSize, search }),
    // Keep showing the previous page/search while the next one loads: without it a new page or search term
    // has no cached data, so the whole table (including the search box) is replaced by a skeleton.
    placeholderData: keepPreviousData,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddUserToAdminPortalModel) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
    },
    onError: () => {
      toast.error('Failed to create user')
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete user')
    },
  })
}

export function useUserPermissions(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: () => getUserPermissions(userId),
    enabled,
    // Always show what is stored now; never reuse a stale copy when the dialog reopens.
    staleTime: 0,
    gcTime: 0,
  })
}

export function useUpdatePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePermissionsModel) => updatePermissions(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', variables.userId] })
      toast.success('Permissions updated')
    },
    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
      toast.error(message ?? 'Failed to update permissions')
    },
  })
}

export function useSetUserActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      setUserActive(userId, isActive),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(variables.isActive ? 'User activated' : 'User deactivated')
    },
    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
      toast.error(message ?? 'Failed to change the user status')
    },
  })
}

// ---- Bulk actions -------------------------------------------------------------------------------
// There are no bulk endpoints, so a bulk action runs the single-user call for each selected user and
// reports exactly what happened (these used to be sleep() stubs that always claimed success).

export type BulkResult = {
  succeeded: string[]
  failed: { id: string; message: string }[]
}

const errorMessage = (error: unknown): string =>
  (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Request failed'

export async function runBulk(
  ids: string[],
  action: (id: string) => Promise<unknown>
): Promise<BulkResult> {
  const settled = await Promise.allSettled(ids.map((id) => action(id)))
  const result: BulkResult = { succeeded: [], failed: [] }
  settled.forEach((outcome, index) => {
    if (outcome.status === 'fulfilled') result.succeeded.push(ids[index])
    else result.failed.push({ id: ids[index], message: errorMessage(outcome.reason) })
  })
  return result
}

/** Shows one toast that says what really happened: all done, partly done (with the reason), or nothing. */
export function reportBulkResult(result: BulkResult, verbPast: string, noun: { one: string; many: string }) {
  const total = result.succeeded.length + result.failed.length
  const label = (count: number) => `${count} ${count === 1 ? noun.one : noun.many}`
  if (result.failed.length === 0) {
    toast.success(`${verbPast} ${label(result.succeeded.length)}`)
  } else if (result.succeeded.length === 0) {
    toast.error(`Could not change any of the ${label(total)}: ${result.failed[0].message}`)
  } else {
    toast.warning(
      `${verbPast} ${result.succeeded.length} of ${total}. ${result.failed.length} failed: ${result.failed[0].message}`
    )
  }
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userIds: string[]) => runBulk(userIds, deleteUser),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      reportBulkResult(result, 'Deleted', { one: 'user', many: 'users' })
    },
  })
}

export function useBulkSetUserActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userIds, isActive }: { userIds: string[]; isActive: boolean }) =>
      runBulk(userIds, (id) => setUserActive(id, isActive)),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      reportBulkResult(result, variables.isActive ? 'Activated' : 'Deactivated', {
        one: 'user',
        many: 'users',
      })
    },
  })
}
