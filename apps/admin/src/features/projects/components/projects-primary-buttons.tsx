import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectsContext } from './projects-provider'

export function ProjectsPrimaryButtons() {
  const { setOpen } = useProjectsContext()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Project</span> <Plus size={18} />
      </Button>
    </div>
  )
}
