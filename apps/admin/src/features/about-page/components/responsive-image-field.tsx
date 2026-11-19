import type { ResponsiveFileModelOptional } from '@repo/shared'
import { ImageUploadField } from '@/components/upload/image-upload-field'

interface ResponsiveImageFieldProps {
  value?: ResponsiveFileModelOptional
  onChange: (value: ResponsiveFileModelOptional) => void
  disabled?: boolean
}

// A single upload drives all three breakpoints — this codebase's `ResponsiveFileSchema`
// supports per-breakpoint images, but the admin doesn't need that granularity for these
// CMS sections, so we keep the UI to one upload and mirror it across desktop/tablet/mobile.
export function ResponsiveImageField({ value, onChange, disabled }: ResponsiveImageFieldProps) {
  return (
    <ImageUploadField
      value={value?.desktop || undefined}
      onChange={(url) => onChange({ desktop: url, tablet: url, mobile: url })}
      disabled={disabled}
    />
  )
}
