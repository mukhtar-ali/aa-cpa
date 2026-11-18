import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { UnitModel } from '@repo/shared'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { DataTableRowActions } from './units-data-table-row-actions'

export const unitsColumns: ColumnDef<UnitModel>[] = [
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
    id: 'thumbnail',
    accessorFn: (row) => row.thumbnail ?? '',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Thumbnail' />,
    cell: ({ row }) =>
      row.original.thumbnail ? (
        <img
          src={row.original.thumbnail}
          alt={row.original.title?.en || ''}
          className='h-10 w-14 rounded object-cover'
        />
      ) : (
        <div className='bg-muted text-muted-foreground flex h-10 w-14 items-center justify-center rounded text-xs'>
          —
        </div>
      ),
    enableSorting: false,
  },
  {
    id: 'title',
    accessorFn: (row) => row.title?.en || row.slug || '',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
    cell: ({ row }) => (
      <div>
        <LongText className='max-w-56 font-medium'>{row.getValue('title')}</LongText>
        {row.original.slug && (
          <p className='text-xs text-muted-foreground'>/{row.original.slug}</p>
        )}
      </div>
    ),
    enableHiding: false,
  },
  {
    id: 'type',
    accessorFn: (row) => row.type?.en || '',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
    cell: ({ row }) => <div className='w-fit text-nowrap'>{row.getValue('type') || '—'}</div>,
  },
  {
    id: 'bedrooms',
    accessorKey: 'bedrooms',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Bedrooms' />,
    cell: ({ row }) => <div>{row.original.bedrooms ?? 0}</div>,
  },
  {
    id: 'bathrooms',
    accessorKey: 'bathrooms',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Bathrooms' />,
    cell: ({ row }) => <div>{row.original.bathrooms ?? 0}</div>,
  },
  {
    id: 'price',
    accessorFn: (row) => row.price || '',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Price' />,
    cell: ({ row }) => <div className='w-fit text-nowrap'>{row.original.price || '—'}</div>,
  },
  {
    id: 'status',
    accessorFn: (row) => (row.isPublished ? 'published' : 'draft'),
    header: ({ column }) => <DataTableColumnHeader column={column} title='Published' />,
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
