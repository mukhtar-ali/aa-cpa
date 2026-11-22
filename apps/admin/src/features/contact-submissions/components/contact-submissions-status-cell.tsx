import type { ContactModel, ContactStatusModel } from '@repo/shared'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateContactSubmissionStatus } from '../hooks/use-contact-submissions'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
] as const

export function ContactSubmissionsStatusCell({ contact }: { contact: ContactModel }) {
  const updateStatus = useUpdateContactSubmissionStatus()

  return (
    <Select
      value={contact.status}
      onValueChange={(status) =>
        updateStatus.mutate({ id: contact.id, data: { status: status as ContactStatusModel['status'] } })
      }
    >
      <SelectTrigger className='w-32'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
