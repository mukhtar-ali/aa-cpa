import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BilingualField, type MultiLangValue } from './BilingualField'

export interface ImageFieldValue {
  url: string
  width?: number
  height?: number
  alt: MultiLangValue
}

export interface ImageFieldProps {
  label: string
  value?: ImageFieldValue | null
  onChange: (next: ImageFieldValue | null) => void
  namePrefix?: string
}

export function ImageField({
  label,
  value,
  onChange,
  namePrefix = 'image-field',
}: ImageFieldProps) {
  const current: ImageFieldValue = {
    url: value?.url ?? '',
    width: value?.width ?? 1200,
    height: value?.height ?? 800,
    alt: {
      ar: value?.alt?.ar ?? '',
      en: value?.alt?.en ?? '',
    },
  }

  return (
    <div className='space-y-3 rounded-md border p-3' data-testid={namePrefix}>
      <Label className='text-sm font-semibold'>{label}</Label>
      <div className='grid gap-3 sm:grid-cols-3'>
        <div className='space-y-1 sm:col-span-1'>
          <Label className='text-xs'>Image URL</Label>
          <Input
            aria-label={`${label} URL`}
            data-testid={`${namePrefix}-url`}
            value={current.url}
            placeholder='/uploads/images/photo.webp'
            onChange={(e) =>
              onChange({
                ...current,
                url: e.target.value,
              })
            }
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs'>Width (px)</Label>
          <Input
            type='number'
            aria-label={`${label} Width`}
            data-testid={`${namePrefix}-width`}
            value={current.width}
            onChange={(e) =>
              onChange({
                ...current,
                width: Number(e.target.value) || 800,
              })
            }
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs'>Height (px)</Label>
          <Input
            type='number'
            aria-label={`${label} Height`}
            data-testid={`${namePrefix}-height`}
            value={current.height}
            onChange={(e) =>
              onChange({
                ...current,
                height: Number(e.target.value) || 600,
              })
            }
          />
        </div>
      </div>
      <BilingualField
        label={`${label} Alt Text`}
        namePrefix={`${namePrefix}-alt`}
        value={current.alt}
        onChange={(alt) =>
          onChange({
            ...current,
            alt,
          })
        }
      />
    </div>
  )
}
