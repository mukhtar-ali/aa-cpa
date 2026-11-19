import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Briefcase, Eye, Newspaper } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardContentItem, DashboardContentType, DashboardStats } from '@/lib/dashboard-api'

interface ContentPipelineProps {
  stats?: DashboardStats
  isLoading: boolean
}

const COLUMN_CONFIG: Record<
  DashboardContentType,
  { label: string; icon: typeof Newspaper; headerClass: string; href: string }
> = {
  news: { label: 'News & Events', icon: Newspaper, headerClass: 'border-border', href: '/news' },
  jobs: { label: 'Careers', icon: Briefcase, headerClass: 'border-border', href: '/careers' },
}

export function ContentPipeline({ stats, isLoading }: ContentPipelineProps) {
  const navigate = useNavigate()
  const columns: DashboardContentType[] = ['news', 'jobs']

  return (
    <div className='grid gap-4 sm:grid-cols-1 lg:grid-cols-2'>
      {columns.map((type) => {
        const config = COLUMN_CONFIG[type]
        const Icon = config.icon
        const items: DashboardContentItem[] = stats?.recentContent[type] ?? []

        return (
          <div key={type} className={`rounded-xl border-2 ${config.headerClass}`}>
            <div className='flex items-center gap-2 border-b p-3'>
              <Icon className='h-4 w-4' />
              <span className='text-sm font-semibold'>{config.label}</span>
            </div>
            <div className='space-y-2 p-3'>
              {isLoading ? (
                <p className='text-sm text-muted-foreground'>Loading...</p>
              ) : items.length === 0 ? (
                <p className='text-sm text-muted-foreground'>Nothing here yet.</p>
              ) : (
                items.map((item) => (
                  <Card
                    key={item.id}
                    className='group cursor-pointer p-3 transition-colors hover:border-primary/40'
                    onClick={() => navigate({ to: config.href })}
                  >
                    <CardContent className='flex items-center justify-between gap-2 p-0'>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium'>{item.title}</p>
                        <p className='text-xs text-muted-foreground'>
                          Updated {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant={item.isPublished ? 'success' : 'secondary'} className='text-xs'>
                          {item.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <Eye className='h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100' />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
