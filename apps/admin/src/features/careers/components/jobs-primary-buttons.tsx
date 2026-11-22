import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useJobsContext } from './jobs-provider'

export function JobsPrimaryButtons() {
  const { setOpen } = useJobsContext()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Job Posting</span> <Plus size={18} />
      </Button>
    </div>
  )
}
