import { useNavigate } from '@tanstack/react-router'
import { Briefcase, Check, FileText, Mail, Newspaper, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardStats } from '@/lib/dashboard-api'

interface PendingActionsProps {
  stats?: DashboardStats
  isLoading: boolean
}

export function PendingActions({ stats, isLoading }: PendingActionsProps) {
  const navigate = useNavigate()

  const items = [
    {
      key: 'contact',
      label: 'New contact messages to review',
      count: stats?.contact.new ?? 0,
      icon: Mail,
      href: '/contact-submissions',
    },
    {
      key: 'applications',
      label: 'Job applications awaiting review',
      count: stats?.jobs.pendingApplications ?? 0,
      icon: UserCheck,
      href: '/careers',
    },
    {
      key: 'news-draft',
      label: 'Draft news articles to publish',
      count: stats?.news.draft ?? 0,
      icon: Newspaper,
      href: '/news',
    },
    {
      key: 'jobs-draft',
      label: 'Draft job postings to publish',
      count: stats?.jobs.draft ?? 0,
      icon: Briefcase,
      href: '/careers',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className='space-y-2'>
          {items.map((item) => {
            const Icon = item.icon
            const done = !isLoading && item.count === 0
            return (
              <li key={item.key}>
                <button
                  type='button'
                  onClick={() => navigate({ to: item.href })}
                  className='flex w-full items-center gap-3 rounded-lg border p-3 text-start transition-colors hover:bg-accent'
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border',
                      done && 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
                    )}
                  >
                    {done && <Check className='size-3' aria-label='Nothing waiting' />}
                  </span>
                  <Icon className='h-4 w-4 shrink-0 text-muted-foreground' />
                  <span className={cn('flex-1 text-sm', done && 'text-muted-foreground')}>
                    {item.label}
                  </span>
                  <Badge variant={done ? 'outline' : 'secondary'}>{isLoading ? '-' : item.count}</Badge>
                </button>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
