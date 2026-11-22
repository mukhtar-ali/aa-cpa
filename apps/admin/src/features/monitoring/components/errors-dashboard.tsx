/**
 * ErrorsDashboard Component
 *
 * Dashboard for error tracking and monitoring
 * Displays:
 * - Error list with pagination
 * - Error detail modal
 * - Error type filtering
 */
import { PageHeader } from '@/components/layout/page-header'
import { useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  ExternalLink,
  Clock,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TableSkeleton } from '@/components/table-skeleton'
import { useErrors } from '../hooks/use-errors'
import type { ErrorType, MonitoringError } from '../types'

// ============= Error Type Icons =============

function getErrorIcon(type: ErrorType) {
  switch (type) {
    case 'error':
      return <Bug className='h-4 w-4' />
    case 'unhandledrejection':
      return <AlertTriangle className='h-4 w-4' />
    case 'api':
      return <ExternalLink className='h-4 w-4' />
  }
}

function getErrorBadgeVariant(
  type: ErrorType
): 'default' | 'destructive' | 'outline' {
  switch (type) {
    case 'error':
      return 'destructive'
    case 'unhandledrejection':
      return 'destructive'
    case 'api':
      return 'outline'
  }
}

// ============= Error List =============

interface ErrorListProps {
  type: ErrorType | 'all'
  page: number
  limit: number
  onPageChange: (page: number) => void
  onErrorSelect: (error: MonitoringError) => void
}

function ErrorList({
  type,
  page,
  limit,
  onPageChange,
  onErrorSelect,
}: ErrorListProps) {
  const { data, isLoading, error } = useErrors({ type, page, limit })

  if (isLoading) {
    return <TableSkeleton columnCount={5} rowCount={10} />
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>Failed to load errors</AlertDescription>
      </Alert>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='text-center text-muted-foreground'>
            <AlertTriangle className='mx-auto mb-4 h-12 w-12 opacity-20' />
            <div className='text-sm'>No errors recorded</div>
            <div className='text-xs'>
              JavaScript errors will appear here when they occur
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Error List */}
      <div className='rounded-md border'>
        <div className='grid grid-cols-12 gap-4 border-b bg-muted p-3 text-xs font-medium'>
          <div className='col-span-2'>Type</div>
          <div className='col-span-4'>Message</div>
          <div className='col-span-3'>Page</div>
          <div className='col-span-2'>Time</div>
          <div className='col-span-1'></div>
        </div>
        {data.data.map((error) => (
          <div
            key={error.id}
            className='grid cursor-pointer grid-cols-12 gap-4 border-b p-3 text-xs hover:bg-muted/50'
            onClick={() => onErrorSelect(error)}
          >
            <div className='col-span-2'>
              <Badge
                variant={getErrorBadgeVariant(error.type)}
                className='flex w-fit items-center gap-1'
              >
                {getErrorIcon(error.type)}
                {error.type}
              </Badge>
            </div>
            <div className='col-span-4 truncate font-medium'>
              {error.message}
            </div>
            <div className='col-span-3 truncate text-muted-foreground'>
              {error.page}
            </div>
            <div className='col-span-2 flex items-center gap-1 text-muted-foreground'>
              <Clock className='h-3 w-3' />
              {new Date(error.timestamp).toLocaleTimeString()}
            </div>
            <div className='col-span-1 text-right'>
              <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                <ExternalLink className='h-3 w-3' />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            Showing {(page - 1) * limit + 1} to{' '}
            {Math.min(page * limit, data.total)} of {data.total} errors
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className='text-sm'>
              Page {page} of {data.totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(page + 1)}
              disabled={page === data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============= Error Detail Modal =============

interface ErrorDetailModalProps {
  error: MonitoringError | null
  open: boolean
  onClose: () => void
}

function ErrorDetailModal({ error, open, onClose }: ErrorDetailModalProps) {
  if (!error) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            {getErrorIcon(error.type)}
            <DialogTitle>Error Details</DialogTitle>
          </div>
          <DialogDescription>Error ID: {error.id}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Error Type */}
          <div>
            <div className='text-sm font-medium text-muted-foreground'>
              Type
            </div>
            <Badge variant={getErrorBadgeVariant(error.type)} className='mt-1'>
              {error.type}
            </Badge>
          </div>

          {/* Message */}
          <div>
            <div className='text-sm font-medium text-muted-foreground'>
              Message
            </div>
            <div className='mt-1 rounded-lg bg-muted p-3 font-mono text-sm'>
              {error.message}
            </div>
          </div>

          {/* Stack Trace */}
          {error.stack && (
            <div>
              <div className='text-sm font-medium text-muted-foreground'>
                Stack Trace
              </div>
              <div className='mt-1 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs'>
                <pre className='whitespace-pre-wrap'>{error.stack}</pre>
              </div>
            </div>
          )}

          {/* Page */}
          <div>
            <div className='text-sm font-medium text-muted-foreground'>
              Page
            </div>
            <div className='mt-1 font-mono text-sm'>{error.page}</div>
          </div>

          {/* Timestamp */}
          <div>
            <div className='text-sm font-medium text-muted-foreground'>
              Timestamp
            </div>
            <div className='mt-1 text-sm'>
              {new Date(error.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Session ID */}
          <div>
            <div className='text-sm font-medium text-muted-foreground'>
              Session ID
            </div>
            <div className='mt-1 font-mono text-xs'>
              {'sessionId' in error
                ? (error as { sessionId: string }).sessionId
                : 'N/A'}
            </div>
          </div>

          {/* Context */}
          {error.context && Object.keys(error.context).length > 0 && (
            <div>
              <div className='text-sm font-medium text-muted-foreground'>
                Context
              </div>
              <div className='mt-1 rounded-lg bg-muted p-3 text-xs'>
                <pre className='whitespace-pre-wrap'>
                  {JSON.stringify(error.context, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============= Main ErrorsDashboard Component =============

export function ErrorsDashboard() {
  const [type, setType] = useState<ErrorType | 'all'>('all')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [selectedError, setSelectedError] = useState<MonitoringError | null>(
    null
  )
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const handleTypeChange = (newType: ErrorType | 'all') => {
    setType(newType)
    setPage(1) // Reset to first page when changing type
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleErrorSelect = (error: MonitoringError) => {
    setSelectedError(error)
    setDetailModalOpen(true)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <PageHeader
        title='Error Tracking'
        description='Monitor JavaScript errors, API failures, and unhandled rejections'
      />

      {/* Type Filter */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Error Log</h3>

        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Filter:</span>
            <Tabs
              value={type}
              onValueChange={(v) => handleTypeChange(v as ErrorType | 'all')}
            >
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='all'>All</TabsTrigger>
                <TabsTrigger value='error'>JS Errors</TabsTrigger>
                <TabsTrigger value='api'>API Errors</TabsTrigger>
                <TabsTrigger value='unhandledrejection'>Rejections</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Error List */}
      <ErrorList
        type={type}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onErrorSelect={handleErrorSelect}
      />

      {/* Error Detail Modal */}
      <ErrorDetailModal
        error={selectedError}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedError(null)
        }}
      />

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Error Tracking</CardTitle>
          <CardDescription>
            Understanding how errors are captured and displayed
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <div className='font-medium'>JavaScript Errors</div>
              <div className='text-sm text-muted-foreground'>
                Automatically captured from window.onerror. Includes full stack
                trace and contextual information.
              </div>
            </div>
            <div className='space-y-2'>
              <div className='font-medium'>API Errors</div>
              <div className='text-sm text-muted-foreground'>
                Captured from failed API calls. Includes endpoint URL, status
                code, and response data.
              </div>
            </div>
            <div className='space-y-2'>
              <div className='font-medium'>Unhandled Rejections</div>
              <div className='text-sm text-muted-foreground'>
                Captured from unhandled Promise rejections. Helps catch async
                errors that would otherwise be silent.
              </div>
            </div>
          </div>
          <div className='mt-4 rounded-lg bg-muted p-4 text-sm'>
            <p className='text-muted-foreground'>
              Errors are aggregated by type and date in the background. The raw
              error data is retained for 30 days to help with debugging
              production issues.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
