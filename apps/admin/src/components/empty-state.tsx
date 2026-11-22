import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  /** Optional call to action, e.g. an "Add project" button. */
  children?: React.ReactNode
  className?: string
}

/** What a table or list shows when there is nothing to show: say so, and offer the next step. */
export function EmptyState({ icon: Icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 px-4 py-12 text-center', className)}>
      {Icon && (
        <div className='mb-1 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground'>
          <Icon className='size-5' />
        </div>
      )}
      <p className='text-sm font-medium'>{title}</p>
      {description && <p className='max-w-sm text-sm text-muted-foreground'>{description}</p>}
      {children && <div className='mt-2'>{children}</div>}
    </div>
  )
}
