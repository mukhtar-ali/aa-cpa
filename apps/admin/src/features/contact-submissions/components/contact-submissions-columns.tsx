import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { ContactModel } from '@repo/shared'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { ContactSubmissionsRowActions } from './contact-submissions-row-actions'
import { ContactSubmissionsStatusCell } from './contact-submissions-status-cell'

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  new: 'default',
  contacted: 'secondary',
  closed: 'outline',
}

export const contactSubmissionsColumns: ColumnDef<ContactModel>[] = [
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
    id: 'fullName',
    accessorKey: 'fullName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    cell: ({ row }) => (
      <div>
        <p className='font-medium'>{row.getValue('fullName')}</p>
        <p className='text-xs text-muted-foreground'>{row.original.email}</p>
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
    id: 'subject',
    accessorKey: 'subject',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
    cell: ({ row }) => (
      <div>
        <p className='max-w-60 truncate' title={row.getValue('subject') as string}>{row.getValue('subject')}</p>
        <p className='text-xs text-muted-foreground'>{row.original.department}</p>
      </div>
    ),
  },
  {
    id: 'message',
    accessorKey: 'message',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Message' />,
    cell: ({ row }) => <LongText className='max-w-44'>{row.getValue('message') || '—'}</LongText>,
    enableSorting: false,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <Badge variant={STATUS_BADGE_VARIANT[row.original.status] ?? 'outline'} className='capitalize'>
          {row.original.status}
        </Badge>
        <ContactSubmissionsStatusCell contact={row.original} />
      </div>
    ),
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
  },
  {
    id: 'actions',
    cell: ({ row }) => <ContactSubmissionsRowActions contact={row.original} />,
  },
]
