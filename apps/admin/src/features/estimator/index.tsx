import React, { useState } from 'react'
import { EstimatorConfigSchema, type EstimatorConfig } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BilingualField } from '@/components/cms'

export function EstimatorAdmin({
  initialConfig,
  onSave,
}: {
  initialConfig?: Partial<EstimatorConfig>
  onSave?: (config: EstimatorConfig) => Promise<void> | void
}) {
  const [config, setConfig] = useState<EstimatorConfig>({
    status: initialConfig?.status ?? 'draft',
    currency: initialConfig?.currency ?? 'SAR',
    spreadPercent: initialConfig?.spreadPercent ?? 15,
    roundingTo: initialConfig?.roundingTo ?? 500,
    disclaimer: initialConfig?.disclaimer ?? {
      ar: 'هذا التقدير استرشادي فقط.',
      en: 'Indicative estimate only.',
    },
    questions: initialConfig?.questions ?? [],
    pricing: initialConfig?.pricing ?? {
      serviceBases: { 'external-audit': 25000 },
      revenueBands: [],
      entityFactors: {},
      booksFactors: {},
    },
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = EstimatorConfigSchema.safeParse(config)
    if (!parsed.success) {
      const nextErr: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        nextErr[issue.path.join('.')] = issue.message
      }
      setErrors(nextErr)
      return
    }
    setErrors({})
    await onSave?.(parsed.data)
  }

  return (
    <div className='space-y-6 p-4' data-testid='estimator-feature'>
      <h1 className='text-2xl font-bold'>Fee Estimator Configuration</h1>
      <Card>
        <CardHeader>
          <CardTitle>Estimator Rules & Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4' data-testid='estimator-form'>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div className='space-y-1'>
                <Label htmlFor='est-status'>Approval Status</Label>
                <select
                  id='est-status'
                  data-testid='estimator-status-select'
                  value={config.status}
                  className='w-full rounded-md border px-3 py-2 text-sm'
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      status: e.target.value as 'draft' | 'approved',
                    })
                  }
                >
                  <option value='draft'>Draft (Hidden from public)</option>
                  <option value='approved'>Approved (Live on public web)</option>
                </select>
              </div>
              <div className='space-y-1'>
                <Label htmlFor='est-spread'>Spread (%)</Label>
                <Input
                  id='est-spread'
                  type='number'
                  data-testid='estimator-spread-input'
                  value={config.spreadPercent}
                  onChange={(e) =>
                    setConfig({ ...config, spreadPercent: Number(e.target.value) })
                  }
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='est-rounding'>Rounding Increment (SAR)</Label>
                <Input
                  id='est-rounding'
                  type='number'
                  data-testid='estimator-rounding-input'
                  value={config.roundingTo}
                  onChange={(e) =>
                    setConfig({ ...config, roundingTo: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <BilingualField
              label='Disclaimer Copy'
              namePrefix='estimator-disclaimer'
              requiredAr
              multiline
              value={config.disclaimer}
              errorAr={errors['disclaimer.ar']}
              onChange={(disclaimer) => setConfig({ ...config, disclaimer })}
            />

            <Button type='submit' data-testid='estimator-submit-btn'>
              Save Estimator Config
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
