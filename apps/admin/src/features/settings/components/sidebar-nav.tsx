import { useState, type JSX } from 'react'
import { useLocation, useNavigate, Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SidebarNavProps = React.HTMLAttributes<HTMLElement> & {
  groups: {
    title: string
    items: {
      href: string
      title: string
      icon: JSX.Element
    }[]
  }[]
}

export function SidebarNav({ className, groups, ...props }: SidebarNavProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [val, setVal] = useState(pathname ?? '/settings')

  const handleSelect = (e: string) => {
    setVal(e)
    navigate({ to: e })
  }

  // Flatten items for mobile select
  const allItems = groups.flatMap(g => g.items)

  return (
    <>
      <div className='p-1 md:hidden'>
        <Select value={val} onValueChange={handleSelect}>
          <SelectTrigger className='h-12 sm:w-48'>
            <SelectValue placeholder='Theme' />
          </SelectTrigger>
          <SelectContent>
            {allItems.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className='flex gap-x-4 px-2 py-1'>
                  <span className='scale-125'>{item.icon}</span>
                  <span className='text-md'>{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea
        orientation='horizontal'
        type='always'
        className='hidden w-full min-w-40 bg-background px-1 py-2 md:block'
      >
        <nav
          className={cn(
            'flex flex-col space-y-4 lg:space-x-0',
            className
          )}
          {...props}
        >
          {groups.map((group) => (
            <div key={group.title} className='space-y-1'>
              <h4 className='mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground'>
                {group.title}
              </h4>
              <div className='space-y-1'>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      buttonVariants({ variant: 'ghost' }),
                      pathname === item.href
                        ? 'bg-muted hover:bg-accent'
                        : 'hover:bg-accent hover:underline',
                      'w-full justify-start'
                    )}
                  >
                    <span className='me-2'>{item.icon}</span>
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </>
  )
}
