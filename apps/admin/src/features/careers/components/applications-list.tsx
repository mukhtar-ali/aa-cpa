import { useState } from 'react'
import { FileText, Loader2, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { JobApplicationModel } from '@repo/shared'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteJobApplication, useUpdateJobApplicationStatus } from '../hooks/use-job-applications'

interface ApplicationsListProps {
  items: JobApplicationModel[]
  isLoading: boolean
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' },
] as const

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  reviewed: 'outline',
  rejected: 'destructive',
  hired: 'default',
}

export function ApplicationsList({ items, isLoading }: ApplicationsListProps) {
  const updateStatus = useUpdateJobApplicationStatus()
  const deleteApplication = useDeleteJobApplication()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-20 w-full' />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return <p className='py-8 text-center text-muted-foreground'>No applications yet.</p>
  }

  const pendingDelete = items.find((i) => i.id === pendingDeleteId) ?? null

  return (
    <div className='space-y-2'>
      {items.map((application) => (
        <Card key={application.id} className='flex flex-wrap items-center justify-between gap-3 p-4'>
          <div>
            <p className='font-medium'>
              {application.firstName} {application.lastName}
            </p>
            <p className='text-xs text-muted-foreground'>
              {application.email} · applying for {application.job?.title?.en ?? 'a deleted job'}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant={STATUS_BADGE_VARIANT[application.status] ?? 'outline'} className='capitalize'>
              {application.status}
            </Badge>
            {application.resumeUrl && (
              <Button variant='ghost' size='icon' asChild>
                <a href={application.resumeUrl} target='_blank' rel='noopener noreferrer' title='View resume'>
                  <FileText className='h-4 w-4' />
                </a>
              </Button>
            )}
            <Select
              value={application.status}
              onValueChange={(status) =>
                updateStatus.mutate({ id: application.id, data: { status: status as JobApplicationModel['status'] } })
              }
            >
              <SelectTrigger className='w-36'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant='ghost' size='icon' onClick={() => setPendingDeleteId(application.id)}>
              <Trash2 className='h-4 w-4 text-destructive' />
            </Button>
          </div>
        </Card>
      ))}

      {pendingDelete && (
        <ConfirmDialog
          open={!!pendingDelete}
          onOpenChange={(state) => {
            if (!deleteApplication.isPending && !state) setPendingDeleteId(null)
          }}
          handleConfirm={async () => {
            await deleteApplication.mutateAsync(pendingDelete.id)
            setPendingDeleteId(null)
          }}
          title={<span className='text-destructive'>Delete Application</span>}
          desc={`Delete the application from ${pendingDelete.firstName} ${pendingDelete.lastName}? This action cannot be undone.`}
          confirmText={
            <>
              {deleteApplication.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {deleteApplication.isPending ? 'Deleting...' : 'Delete'}
            </>
          }
          isLoading={deleteApplication.isPending}
          destructive
        />
      )}
    </div>
  )
}
