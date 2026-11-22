import { Briefcase, Newspaper } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardContentType, DashboardStats } from '@/lib/dashboard-api'

interface ContentOverviewProps {
  stats?: DashboardStats
  isLoading: boolean
}

const TYPE_CONFIG: Record<DashboardContentType, { label: string; icon: typeof Newspaper; iconClass: string; chipClass: string; barClass: string }> = {
  news: { label: 'Articles', icon: Newspaper, iconClass: 'text-muted-foreground', chipClass: 'bg-muted', barClass: 'bg-primary' },
  jobs: { label: 'Jobs', icon: Briefcase, iconClass: 'text-muted-foreground', chipClass: 'bg-muted', barClass: 'bg-primary' },
}

export function ContentOverview({ stats, isLoading }: ContentOverviewProps) {
  const totalPublished = stats ? stats.news.published + stats.jobs.published : 0
  const totalAll = stats ? stats.news.total + stats.jobs.total : 0
  const publishedRatio = totalAll > 0 ? totalPublished / totalAll : 0
  const circumference = 2 * Math.PI * 15.9155

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-6 sm:grid-cols-2'>
          <div className='flex flex-col items-center justify-center gap-3'>
            <div className='relative h-32 w-32'>
              <svg viewBox='0 0 36 36' className='h-32 w-32 -rotate-90'>
                <circle cx='18' cy='18' r='15.9155' fill='none' stroke='hsl(var(--muted))' strokeWidth='3' />
                {!isLoading && totalAll > 0 && (
                  <circle
                    cx='18'
                    cy='18'
                    r='15.9155'
                    fill='none'
                    stroke='hsl(var(--primary))'
                    strokeWidth='3'
                    strokeDasharray={`${publishedRatio * circumference} ${circumference}`}
                    strokeLinecap='round'
                  />
                )}
              </svg>
              <div className='absolute inset-0 flex flex-col items-center justify-center text-center'>
                <div className='text-2xl font-bold'>{isLoading ? '-' : `${Math.round(publishedRatio * 100)}%`}</div>
                <div className='text-xs text-muted-foreground'>Published</div>
              </div>
            </div>
            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              <span className='flex items-center gap-1.5'>
                <span className='h-2 w-2 rounded-full bg-primary' /> Published ({totalPublished})
              </span>
              <span className='flex items-center gap-1.5'>
                <span className='h-2 w-2 rounded-full bg-muted' /> Draft ({totalAll - totalPublished})
              </span>
            </div>
          </div>

          <div className='space-y-4'>
            <p className='text-xs font-medium text-muted-foreground'>Content by Type</p>
            {stats?.contentByType.map((item) => {
              const config = TYPE_CONFIG[item.type]
              const Icon = config.icon
              const draft = item.total - item.published
              const width = item.total > 0 ? `${Math.round((item.published / item.total) * 100)}%` : '0%'
              return (
                <div key={item.type} className='space-y-1.5'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <div className={`rounded-md p-1 ${config.chipClass}`}>
                        <Icon className={`h-3.5 w-3.5 ${config.iconClass}`} />
                      </div>
                      <span className='text-sm'>{config.label}</span>
                    </div>
                    {draft > 0 && (
                      <Badge variant='destructive' className='text-xs'>
                        {draft} draft
                      </Badge>
                    )}
                  </div>
                  <div className='h-1.5 w-full rounded-full bg-muted'>
                    <div className={`h-1.5 rounded-full ${config.barClass}`} style={{ width }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
