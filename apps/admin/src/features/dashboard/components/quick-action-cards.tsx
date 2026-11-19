import { useNavigate } from '@tanstack/react-router'
import { FileText, MessageSquare, Phone, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardStats } from '@/lib/dashboard-api'

interface QuickActionCardsProps {
  stats?: DashboardStats
  isLoading: boolean
}

interface QuickActionCardConfig {
  title: string
  count: number
  icon: typeof MessageSquare
  iconClass: string
  chipClass: string
  href: string
}

export function QuickActionCards({ stats, isLoading }: QuickActionCardsProps) {
  const navigate = useNavigate()

  const cards: QuickActionCardConfig[] = [
    {
      title: 'New Contact Messages',
      count: stats?.contact.new ?? 0,
      icon: MessageSquare,
      iconClass: 'text-muted-foreground',
      chipClass: 'bg-muted',
      href: '/contact-submissions',
    },
    {
      title: 'Pending Applications',
      count: stats?.jobs.pendingApplications ?? 0,
      icon: Users,
      iconClass: 'text-muted-foreground',
      chipClass: 'bg-muted',
      href: '/careers',
    },
    {
      title: 'Content to Publish',
      count: (stats?.news.draft ?? 0) + (stats?.jobs.draft ?? 0),
      icon: FileText,
      iconClass: 'text-muted-foreground',
      chipClass: 'bg-muted',
      href: '/news',
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => {
        const Icon = card.icon
        const hasAction = card.count > 0
        return (
          <Card
            key={card.title}
            role='button'
            tabIndex={0}
            onClick={() => navigate({ to: card.href })}
            className={cn(
              'cursor-pointer transition-colors hover:border-primary/40',
              hasAction && 'border-l-4 border-l-primary',
            )}
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
              <div className={cn('rounded-lg p-2', card.chipClass)}>
                <Icon className={cn('h-4 w-4', card.iconClass)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-2'>
                <div className='text-2xl font-bold tabular-nums'>{isLoading ? '-' : card.count}</div>
                {!isLoading && hasAction && (
                  <Badge variant='secondary' className='text-xs'>
                    New
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
