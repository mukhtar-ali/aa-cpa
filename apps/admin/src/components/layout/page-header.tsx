import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: string
  description?: string
  /** Primary actions, shown on the right (wraps below the title on small screens). */
  children?: React.ReactNode
  className?: string
}

/** The title block every admin page starts with: title, one muted line, and the page's main action(s). */
export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className='space-y-1'>
        <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
        {description && <p className='text-muted-foreground'>{description}</p>}
      </div>
      {children && <div className='flex items-center gap-2'>{children}</div>}
    </div>
  )
}
