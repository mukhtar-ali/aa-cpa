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
import type { JobModel } from '@repo/shared'
import { Briefcase } from 'lucide-react'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { EmptyState } from '@/components/empty-state'
import { JobsBulkActions } from './jobs-bulk-actions'
import { jobsColumns as columns } from './jobs-columns'

type JobsTableProps = {
  data: JobModel[]
  search: Record<string, unknown>
  navigate: NavigateFn
  // Total pages reported by the API: the server paginates, the table only shows the current page.
  pageCount: number
}

export function JobsTable({ data, search, navigate, pageCount }: JobsTableProps) {
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
        { columnId: 'employmentType', searchKey: 'employmentType', type: 'array' },
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
            columnId: 'employmentType',
            title: 'Employment type',
            options: [
              { label: 'Full time', value: 'full_time' },
              { label: 'Part time', value: 'part_time' },
              { label: 'Contract', value: 'contract' },
              { label: 'Internship', value: 'internship' },
            ],
          },
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
                  <EmptyState icon={Briefcase} title='No job postings yet' description='Postings you add show up here. Use “Add Job Posting” to create the first one.' />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <JobsBulkActions table={table} />
    </div>
  )
}
