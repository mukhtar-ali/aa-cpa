import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TableSkeletonProps {
  columnCount: number
  rowCount?: number
  showPagination?: boolean
}

export function TableSkeleton({
  columnCount,
  rowCount = 10,
  showPagination = true,
}: TableSkeletonProps) {
  return (
    <div className='space-y-4'>
      {/* Toolbar Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 items-center space-x-2'>
          <Skeleton className='h-8 w-[150px] lg:w-[250px]' />
          <Skeleton className='h-8 w-[70px] border-dashed' />
        </div>
        <Skeleton className='h-8 w-[70px]' />
      </div>

      {/* Table Skeleton */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {/* Key by index is safe here — skeleton items are static, non-reorderable placeholders */}
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className='h-4 w-[80%]' />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Key by index is safe here — skeleton items are static, non-reorderable placeholders */}
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {/* Key by index is safe here — skeleton items are static, non-reorderable placeholders */}
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className='h-4 w-[90%]' />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      {showPagination && (
        <div className='flex items-center justify-between px-2'>
          <Skeleton className='h-4 w-[100px]' />
          <div className='flex items-center space-x-6 lg:space-x-8'>
            <div className='flex items-center space-x-2'>
              <Skeleton className='h-4 w-[70px]' />
              <Skeleton className='h-8 w-[70px]' />
            </div>
            <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
              <Skeleton className='h-4 w-[80px]' />
            </div>
            <div className='flex items-center space-x-2'>
              <Skeleton className='h-8 w-8' />
              <Skeleton className='h-8 w-8' />
              <Skeleton className='h-8 w-8' />
              <Skeleton className='h-8 w-8' />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
