import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUnitsContext } from './units-provider'

export function UnitsPrimaryButtons() {
  const { setOpen } = useUnitsContext()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add unit</span> <Plus size={18} />
      </Button>
    </div>
  )
}
