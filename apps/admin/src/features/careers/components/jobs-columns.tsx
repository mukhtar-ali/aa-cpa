import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { JobModel } from '@repo/shared'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { DataTableRowActions } from './jobs-data-table-row-actions'

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  contract: 'Contract',
  internship: 'Internship',
}

export const jobsColumns: ColumnDef<JobModel>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'title',
    accessorFn: (row) => row.title?.en || row.slug,
    header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
    cell: ({ row }) => (
      <div>
        <LongText className='max-w-56 font-medium'>{row.getValue('title')}</LongText>
        <p className='text-xs text-muted-foreground'>
          {row.original.location?.en ? `${row.original.location.en} · ` : ''}/{row.original.slug}
        </p>
      </div>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    id: 'employmentType',
    accessorFn: (row) => row.employmentType,
    header: ({ column }) => <DataTableColumnHeader column={column} title='Employment type' />,
    cell: ({ row }) => (
      <Badge variant='outline'>
        {EMPLOYMENT_TYPE_LABELS[row.getValue('employmentType') as string] ?? row.getValue('employmentType')}
      </Badge>
    ),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    id: 'status',
    accessorFn: (row) => (row.isPublished ? 'published' : 'draft'),
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => (
      <Badge variant={row.original.isPublished ? 'success' : 'secondary'}>
        {row.original.isPublished ? 'Published' : 'Draft'}
      </Badge>
    ),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
