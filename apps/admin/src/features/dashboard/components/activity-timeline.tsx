import { formatDistanceToNow } from 'date-fns'
import { Inbox, Mail, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardRecentActivityItem } from '@/lib/dashboard-api'

interface ActivityTimelineProps {
  items: DashboardRecentActivityItem[]
  isLoading: boolean
}

const TYPE_CONFIG: Record<
  DashboardRecentActivityItem['type'],
  { icon: typeof Mail; iconClass: string; chipClass: string; badgeLabel: string }
> = {
  contact: { icon: Mail, iconClass: 'text-muted-foreground', chipClass: 'bg-muted', badgeLabel: 'Message' },
  application: { icon: UserPlus, iconClass: 'text-muted-foreground', chipClass: 'bg-muted', badgeLabel: 'Application' },
  inquiry: { icon: Inbox, iconClass: 'text-muted-foreground', chipClass: 'bg-muted', badgeLabel: 'Inquiry' },
}

export function ActivityTimeline({ items, isLoading }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest contact messages, job applications, and inquiries.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className='text-sm text-muted-foreground'>Loading...</p>
        ) : items.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No recent activity yet.</p>
        ) : (
          <ul className='space-y-4'>
            {items.map((item) => {
              const config = TYPE_CONFIG[item.type]
              const Icon = config.icon
              return (
                <li key={`${item.type}-${item.id}`} className='flex items-center gap-4'>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.chipClass}`}>
                    <Icon className={`h-4 w-4 ${config.iconClass}`} />
                  </div>
                  <div className='flex flex-1 flex-wrap items-center justify-between gap-2'>
                    <div className='space-y-1'>
                      <p className='text-sm leading-none font-medium'>{item.label}</p>
                      <p className='text-sm text-muted-foreground'>{item.subLabel}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        {config.badgeLabel}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
