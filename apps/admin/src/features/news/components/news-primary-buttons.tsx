import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNewsContext } from './news-provider'

export function NewsPrimaryButtons() {
  const { setOpen } = useNewsContext()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Article</span> <Plus size={18} />
      </Button>
    </div>
  )
}
