import React, { useState } from 'react'
import { NotificationSettingsSchema, type NotificationSettings } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function NotificationSettingsFeature({
  initialData,
  onSave,
}: {
  initialData?: Partial<NotificationSettings>
  onSave?: (data: NotificationSettings) => Promise<void> | void
}) {
  const [form, setForm] = useState<NotificationSettings>({
    defaultInbox: initialData?.defaultInbox ?? 'info@cpa.sa',
    serviceRecipients: initialData?.serviceRecipients ?? {},
    careersInbox: initialData?.careersInbox ?? 'careers@cpa.sa',
    retentionMonths: initialData?.retentionMonths ?? 12,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = NotificationSettingsSchema.safeParse(form)
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
    <Card data-testid='notification-settings-feature'>
      <CardHeader>
        <CardTitle>Notification & Retention Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-1'>
            <Label htmlFor='default-inbox'>Default Leads Inbox *</Label>
            <Input
              id='default-inbox'
              type='email'
              data-testid='default-inbox-input'
              value={form.defaultInbox}
              onChange={(e) => setForm({ ...form, defaultInbox: e.target.value })}
            />
            {errors['defaultInbox'] && (
              <p className='text-xs text-destructive' role='alert'>
                {errors['defaultInbox']}
              </p>
            )}
          </div>
          <div className='space-y-1'>
            <Label htmlFor='careers-inbox'>Careers Inbox *</Label>
            <Input
              id='careers-inbox'
              type='email'
              data-testid='careers-inbox-input'
              value={form.careersInbox}
              onChange={(e) => setForm({ ...form, careersInbox: e.target.value })}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='retention-months'>CV Retention Period (Months)</Label>
            <Input
              id='retention-months'
              type='number'
              data-testid='retention-months-input'
              value={form.retentionMonths}
              onChange={(e) =>
                setForm({ ...form, retentionMonths: Number(e.target.value) || 12 })
              }
            />
          </div>
          <Button type='submit' data-testid='notification-submit-btn'>
            Save Notification Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
