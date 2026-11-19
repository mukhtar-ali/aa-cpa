import { useEffect, useRef, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

const SEARCH_DEBOUNCE_MS = 400

/**
 * Text box for a SERVER-side search: the value is committed (-> URL -> API request) only after the user
 * pauses typing, so each keystroke does not trigger a request. `draft` is what is being typed; null means
 * "show the committed value", which keeps the box in sync with external changes such as Reset.
 */
function DebouncedSearchInput({
  value,
  onCommit,
  placeholder,
}: {
  value: string
  onCommit: (value: string) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  return (
    <Input
      placeholder={placeholder}
      value={draft ?? value}
      onChange={(event) => {
        const next = event.target.value
        setDraft(next)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => {
          onCommit(next)
          setDraft(null)
        }, SEARCH_DEBOUNCE_MS)
      }}
      className='h-8 w-[150px] lg:w-[250px]'
    />
  )
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Filter...',
  searchKey,
  filters = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter
  // Bumped on Reset so a half-typed search (and its pending timer) is discarded.
  const [resetCount, setResetCount] = useState(0)

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {searchKey ? (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className='h-8 w-[150px] lg:w-[250px]'
          />
        ) : (
          <DebouncedSearchInput
            key={resetCount}
            placeholder={searchPlaceholder}
            value={table.getState().globalFilter ?? ''}
            onCommit={(next) => table.setGlobalFilter(next)}
          />
        )}
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
                showCounts={!table.options.manualFiltering}
              />
            )
          })}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
              setResetCount((count) => count + 1)
            }}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
