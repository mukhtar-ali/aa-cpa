import React, { useState } from 'react'
import { SpamSettingsSchema, type SpamSettings } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SpamSettingsFeature({
  initialData,
  onSave,
}: {
  initialData?: Partial<SpamSettings>
  onSave?: (data: SpamSettings) => Promise<void> | void
}) {
  const [form, setForm] = useState<SpamSettings>({
    turnstileEnabled: initialData?.turnstileEnabled ?? false,
    turnstileSiteKey: initialData?.turnstileSiteKey ?? '',
    minFillSeconds: initialData?.minFillSeconds ?? 3,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = SpamSettingsSchema.safeParse(form)
    if (!parsed.success) return
    await onSave?.(parsed.data)
  }

  return (
    <Card data-testid='spam-settings-feature'>
      <CardHeader>
        <CardTitle>Spam & Bot Protection Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Switch
              checked={form.turnstileEnabled}
              data-testid='turnstile-switch'
              onCheckedChange={(turnstileEnabled) =>
                setForm({ ...form, turnstileEnabled })
              }
            />
            <Label>Enable Cloudflare Turnstile CAPTCHA</Label>
          </div>
          <div className='space-y-1'>
            <Label htmlFor='turnstile-key'>Turnstile Site Key</Label>
            <Input
              id='turnstile-key'
              data-testid='turnstile-key-input'
              value={form.turnstileSiteKey ?? ''}
              onChange={(e) =>
                setForm({ ...form, turnstileSiteKey: e.target.value })
              }
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='min-fill'>Minimum Form Fill Time (seconds)</Label>
            <Input
              id='min-fill'
              type='number'
              data-testid='min-fill-input'
              value={form.minFillSeconds}
              onChange={(e) =>
                setForm({ ...form, minFillSeconds: Number(e.target.value) || 3 })
              }
            />
          </div>
          <Button type='submit' data-testid='spam-submit-btn'>
            Save Spam Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
