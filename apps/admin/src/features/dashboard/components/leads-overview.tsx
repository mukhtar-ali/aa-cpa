import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Calculator, Compass, Layers, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDirection } from '@/context/direction-provider'
import { useLeadStats } from '../hooks/use-lead-stats'

type PeriodPreset = '7d' | '30d' | '90d' | 'custom'

function formatPeriodDates(preset: PeriodPreset): { from: string; to: string } {
  const to = new Date().toISOString().slice(0, 10)
  const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30
  const from = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  return { from, to }
}

const SOURCE_LABELS: Record<string, { ar: string; en: string }> = {
  contact: { ar: 'نموذج التواصل', en: 'Contact Form' },
  estimator: { ar: 'الحاسبة التقديرية', en: 'Cost Estimator' },
  service_page: { ar: 'صفحة الخدمة', en: 'Service Page' },
  careers: { ar: 'طلبات التوظيف', en: 'Job Applications' },
}

export function LeadsOverview() {
  const { dir } = useDirection()
  const isRtl = dir === 'rtl'

  const [preset, setPreset] = useState<PeriodPreset>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const dateRange = useMemo(() => {
    if (preset === 'custom') {
      return {
        from: customFrom || undefined,
        to: customTo || undefined,
      }
    }
    return formatPeriodDates(preset)
  }, [preset, customFrom, customTo])

  const { data: leadStats, isLoading } = useLeadStats(dateRange)

  const totalLeadsBySource = useMemo(
    () => (leadStats?.bySource ?? []).reduce((acc, curr) => acc + curr.count, 0),
    [leadStats]
  )

  const totalLeadsByService = useMemo(
    () => (leadStats?.byService ?? []).reduce((acc, curr) => acc + curr.count, 0),
    [leadStats]
  )

  const totalLeadsByPath = useMemo(
    () => (leadStats?.byPath ?? []).reduce((acc, curr) => acc + curr.count, 0),
    [leadStats]
  )

  const chartData = useMemo(() => {
    return (leadStats?.estimatorCompletions ?? []).map((item) => {
      const d = new Date(item.date)
      const label = isRtl
        ? `${d.getDate()}/${d.getMonth() + 1}`
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return {
        date: item.date,
        label,
        count: item.count,
      }
    })
  }, [leadStats, isRtl])

  return (
    <div className='space-y-4'>
      {/* Header & Period Filters */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-xl font-bold tracking-tight'>
            {isRtl ? 'نظرة عامة على العملاء المحتملين' : 'Leads Overview'}
          </h2>
          <p className='text-xs text-muted-foreground'>
            {isRtl
              ? 'توزيع العملاء حسب المصدر والخدمة وصفحة الهبوط مع إكمالات الحاسبة التقديرية'
              : 'Breakdown of leads by source, service, and landing page with estimator activity'}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-1.5'>
          <Button
            size='sm'
            variant={preset === '7d' ? 'default' : 'outline'}
            onClick={() => setPreset('7d')}
          >
            {isRtl ? 'آخر 7 أيام' : '7 Days'}
          </Button>
          <Button
            size='sm'
            variant={preset === '30d' ? 'default' : 'outline'}
            onClick={() => setPreset('30d')}
          >
            {isRtl ? 'آخر 30 يوم' : '30 Days'}
          </Button>
          <Button
            size='sm'
            variant={preset === '90d' ? 'default' : 'outline'}
            onClick={() => setPreset('90d')}
          >
            {isRtl ? 'آخر 90 يوم' : '90 Days'}
          </Button>
          <Button
            size='sm'
            variant={preset === 'custom' ? 'default' : 'outline'}
            onClick={() => setPreset('custom')}
          >
            {isRtl ? 'مخصص' : 'Custom'}
          </Button>
        </div>
      </div>

      {preset === 'custom' && (
        <Card className='p-3'>
          <div className='flex flex-wrap items-center gap-3 text-xs'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground'>{isRtl ? 'من:' : 'From:'}</span>
              <Input
                type='date'
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className='h-8 w-36 text-xs'
              />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground'>{isRtl ? 'إلى:' : 'To:'}</span>
              <Input
                type='date'
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className='h-8 w-36 text-xs'
              />
            </div>
          </div>
        </Card>
      )}

      {/* Estimator Completions Daily Chart */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <div>
            <CardTitle className='text-base font-semibold'>
              {isRtl ? 'إكمالات الحاسبة التقديرية يومياً' : 'Daily Estimator Completions'}
            </CardTitle>
            <CardDescription className='text-xs'>
              {isRtl
                ? 'عدد المرات التي أكمل فيها المستخدمون نموذج حاسبة التكاليف التقديرية'
                : 'Server-side completion events recorded from the interactive cost estimator'}
            </CardDescription>
          </div>
          <Calculator className='h-5 w-5 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='h-56 w-full pt-2'>
            {isLoading ? (
              <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
                {isRtl ? 'جاري التحميل...' : 'Loading chart...'}
              </div>
            ) : chartData.length === 0 ? (
              <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
                {isRtl ? 'لا توجد بيانات متاحة' : 'No data available'}
              </div>
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                  <XAxis dataKey='label' className='text-[10px] text-muted-foreground' />
                  <YAxis allowDecimals={false} className='text-[10px] text-muted-foreground' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.375rem',
                      fontSize: '12px',
                    }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ''}
                    formatter={(val) => [val, isRtl ? 'الإكمالات' : 'Completions']}
                  />
                  <Bar dataKey='count' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Three Ranked Breakdown Lists / Bars */}
      <div className='grid gap-4 md:grid-cols-3'>
        {/* Breakdown by Source */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-semibold'>
                {isRtl ? 'حسب المصدر' : 'Leads by Source'}
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </div>
            <CardDescription className='text-xs'>
              {isRtl ? `الإجمالي: ${totalLeadsBySource}` : `Total: ${totalLeadsBySource}`}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {isLoading ? (
              <div className='py-6 text-center text-xs text-muted-foreground'>
                {isRtl ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : (leadStats?.bySource ?? []).length === 0 ? (
              <div className='py-6 text-center text-xs text-muted-foreground'>
                {isRtl ? 'لا توجد بيانات' : 'No leads recorded'}
              </div>
            ) : (
              (leadStats?.bySource ?? []).map((item, idx) => {
                const label = isRtl
                  ? SOURCE_LABELS[item.source]?.ar ?? item.source
                  : SOURCE_LABELS[item.source]?.en ?? item.source
                const pct =
                  totalLeadsBySource > 0 ? Math.round((item.count / totalLeadsBySource) * 100) : 0
                return (
                  <div key={item.source} className='space-y-1'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='flex items-center gap-1.5 font-medium'>
                        <span className='text-[10px] text-muted-foreground'>#{idx + 1}</span>
                        {label}
                      </span>
                      <div className='flex items-center gap-1.5'>
                        <span className='text-[10px] text-muted-foreground'>{pct}%</span>
                        <Badge variant='secondary' className='h-5 px-1.5 text-xs font-semibold'>
                          {item.count}
                        </Badge>
                      </div>
                    </div>
                    <div className='h-1.5 w-full rounded-full bg-muted'>
                      <div
                        className='h-1.5 rounded-full bg-primary transition-all'
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Breakdown by Service */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-semibold'>
                {isRtl ? 'حسب الخدمة' : 'Leads by Service'}
              </CardTitle>
              <Layers className='h-4 w-4 text-muted-foreground' />
            </div>
            <CardDescription className='text-xs'>
              {isRtl ? `الإجمالي: ${totalLeadsByService}` : `Total: ${totalLeadsByService}`}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {isLoading ? (
              <div className='py-6 text-center text-xs text-muted-foreground'>
                {isRtl ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : (leadStats?.byService ?? []).length === 0 ? (
              <div className='py-6 text-center text-xs text-muted-foreground'>
                {isRtl ? 'لا توجد بيانات' : 'No service leads'}
              </div>
            ) : (
              (leadStats?.byService ?? []).map((item, idx) => {
                const pct =
                  totalLeadsByService > 0 ? Math.round((item.count / totalLeadsByService) * 100) : 0
                return (
                  <div key={item.serviceId ?? 'unassigned'} className='space-y-1'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='flex items-center gap-1.5 truncate font-medium'>
                        <span className='text-[10px] text-muted-foreground'>#{idx + 1}</span>
                        <span className='truncate'>{item.name}</span>
                      </span>
                      <div className='flex items-center gap-1.5 shrink-0'>
                        <span className='text-[10px] text-muted-foreground'>{pct}%</span>
                        <Badge variant='secondary' className='h-5 px-1.5 text-xs font-semibold'>
                          {item.count}
                        </Badge>
                      </div>
                    </div>
                    <div className='h-1.5 w-full rounded-full bg-muted'>
                      <div
                        className='h-1.5 rounded-full bg-primary transition-all'
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Breakdown by Landing Page */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-semibold'>
                {isRtl ? 'حسب صفحة الهبوط' : 'Leads by Landing Page'}
              </CardTitle>
              <Compass className='h-4 w-4 text-muted-foreground' />
            </div>
            <CardDescription className='text-xs'>
              {isRtl ? `الإجمالي: ${totalLeadsByPath}` : `Total: ${totalLeadsByPath}`}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {isLoading ? (
              <div className='py-6 text-center text-xs text-muted-foreground'>
                {isRtl ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : (leadStats?.byPath ?? []).length === 0 ? (
              <div className='py-6 text-center text-xs text-muted-foreground'>
                {isRtl ? 'لا توجد بيانات' : 'No paths recorded'}
              </div>
            ) : (
              (leadStats?.byPath ?? []).map((item, idx) => {
                const pct =
                  totalLeadsByPath > 0 ? Math.round((item.count / totalLeadsByPath) * 100) : 0
                return (
                  <div key={item.path} className='space-y-1'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='flex items-center gap-1.5 truncate font-medium font-mono text-[11px]'>
                        <span className='text-[10px] font-sans text-muted-foreground'>#{idx + 1}</span>
                        <span className='truncate'>{item.path}</span>
                      </span>
                      <div className='flex items-center gap-1.5 shrink-0'>
                        <span className='text-[10px] text-muted-foreground'>{pct}%</span>
                        <Badge variant='secondary' className='h-5 px-1.5 text-xs font-semibold'>
                          {item.count}
                        </Badge>
                      </div>
                    </div>
                    <div className='h-1.5 w-full rounded-full bg-muted'>
                      <div
                        className='h-1.5 rounded-full bg-primary transition-all'
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
