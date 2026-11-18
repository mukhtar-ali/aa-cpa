import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { UnitModel } from '@repo/shared'
import { Building2 } from 'lucide-react'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { EmptyState } from '@/components/empty-state'
import { UnitsBulkActions } from './units-bulk-actions'
import { unitsColumns as columns } from './units-columns'

type UnitsTableProps = {
  data: UnitModel[]
  search: Record<string, unknown>
  navigate: NavigateFn
  // Total pages reported by the API: the server paginates, the table only shows the current page.
  pageCount: number
}

export function UnitsTable({ data, search, navigate, pageCount }: UnitsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const { globalFilter, onGlobalFilterChange, columnFilters, onColumnFiltersChange, pagination, onPaginationChange, ensurePageInRange } =
    useTableUrlState({
      search,
      navigate,
      pagination: { defaultPage: 1, defaultPageSize: 20 },
      globalFilter: { enabled: true, key: 'search' },
      columnFilters: [
        { columnId: 'status', searchKey: 'status', type: 'array' },
      ],
    })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, pagination, rowSelection, columnFilters, columnVisibility },
    // Key rows (and therefore the selection) by id, not by position on the page.
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onPaginationChange: (updater) => {
      onPaginationChange(updater)
      // A selection must never silently carry over to a different page of results.
      setRowSelection({})
    },
    // Changing a filter or the search changes which rows are shown, so a selection must not outlive it
    // (otherwise rows no longer on screen could still be hit by a bulk action).
    onColumnFiltersChange: (updater) => {
      onColumnFiltersChange(updater)
      setRowSelection({})
    },
    onGlobalFilterChange: (updater) => {
      onGlobalFilterChange?.(updater)
      setRowSelection({})
    },
    // The text search runs on the server (the `search` URL param); the client must not filter the page again.
    globalFilterFn: () => true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    // Facet filters (status, tag, ...) are applied by the API too, so they apply to every page, not just this one.
    manualFiltering: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div className={cn('max-sm:has-[div[role="toolbar"]]:mb-16', 'flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by title...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Published', value: 'published' },
              { label: 'Draft', value: 'draft' },
            ],
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='group/row'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='p-0'>
                  <EmptyState icon={Building2} title='No units yet' description='Units you add to this project show up here.' />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <UnitsBulkActions table={table} />
    </div>
  )
}
