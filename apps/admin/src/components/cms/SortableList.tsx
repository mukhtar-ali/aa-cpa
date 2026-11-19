import React from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface SortableItemBase {
  id: string
}

export interface SortableListProps<T extends SortableItemBase> {
  items: T[]
  onReorder: (newIds: string[], reorderedItems: T[]) => void
  renderItem: (item: T, index: number) => React.ReactNode
}

export function SortableList<T extends SortableItemBase>({
  items,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === String(active.id))
    const newIndex = items.findIndex((i) => i.id === String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(items, oldIndex, newIndex)
    onReorder(
      next.map((i) => i.id),
      next
    )
  }

  const moveIndex = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    const next = arrayMove(items, from, to)
    onReorder(
      next.map((i) => i.id),
      next
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className='space-y-2' data-testid='sortable-list'>
          {items.map((item, idx) => (
            <div
              key={item.id}
              data-testid={`sortable-item-${item.id}`}
              className='flex items-center gap-2 rounded-md border bg-card p-3'
            >
              <GripVertical className='h-4 w-4 shrink-0 text-muted-foreground' />
              <div className='min-w-0 flex-1'>{renderItem(item, idx)}</div>
              <div className='flex items-center gap-1'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  disabled={idx === 0}
                  aria-label={`Move item ${idx + 1} up`}
                  data-testid={`move-up-${item.id}`}
                  onClick={() => moveIndex(idx, idx - 1)}
                >
                  <ArrowUp className='h-4 w-4' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  disabled={idx === items.length - 1}
                  aria-label={`Move item ${idx + 1} down`}
                  data-testid={`move-down-${item.id}`}
                  onClick={() => moveIndex(idx, idx + 1)}
                >
                  <ArrowDown className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
