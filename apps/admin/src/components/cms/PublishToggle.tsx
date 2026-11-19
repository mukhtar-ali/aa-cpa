import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export interface PublishToggleProps {
  isPublished: boolean
  canPublish?: boolean
  hasArabicRequired?: boolean
  guardMessage?: string
  onToggle: (nextPublished: boolean) => void
  disabled?: boolean
}

export function PublishToggle({
  isPublished,
  canPublish,
  hasArabicRequired,
  guardMessage = 'Arabic required fields must be filled before publishing.',
  onToggle,
  disabled = false,
}: PublishToggleProps) {
  const allowed =
    hasArabicRequired !== undefined
      ? hasArabicRequired
      : canPublish !== undefined
        ? canPublish
        : true
  const blocked = !isPublished && !allowed

  return (
    <div className='space-y-1' data-testid='publish-toggle-container'>
      <div className='flex items-center gap-2'>
        <Switch
          checked={isPublished}
          disabled={disabled || blocked}
          aria-label='Publish status'
          data-testid='publish-toggle-switch'
          onCheckedChange={(checked) => {
            if (checked && !allowed) return
            onToggle(checked)
          }}
        />
        <Label className='text-sm font-medium'>
          {isPublished ? 'Published' : 'Draft'}
        </Label>
      </div>
      {blocked && (
        <p
          className='text-xs text-destructive'
          data-testid='publish-guard-alert'
          role='alert'
        >
          {guardMessage}
        </p>
      )}
    </div>
  )
}
