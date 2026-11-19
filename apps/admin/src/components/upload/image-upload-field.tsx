import { useRef, useState } from 'react'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { validateImageFile } from '@/lib/file-validation'
import { uploadImage } from '@/lib/upload-api'

interface ImageUploadFieldProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function ImageUploadField({ value, onChange, disabled }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return

    const result = validateImageFile(file)
    if (!result.valid) {
      toast.error(result.error)
      return
    }

    setIsUploading(true)
    setProgress(0)
    try {
      const url = await uploadImage(result.file, setProgress)
      onChange(url)
      toast.success('Image uploaded')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const openPicker = () => {
    if (!disabled && !isUploading) inputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <div
        className={[
          'group relative flex h-40 w-full items-center justify-center overflow-hidden rounded-lg border transition-colors',
          isDragOver ? 'border-primary bg-primary/5' : 'border-input bg-muted/30',
          disabled || isUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
        ].join(' ')}
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled && !isUploading) setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          if (!disabled && !isUploading) void handleFile(e.dataTransfer.files?.[0])
        }}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Uploading{progress > 0 ? ` ${progress}%` : '...'}</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Button type="button" variant="secondary" size="sm" onClick={openPicker}>
                <Upload className="h-4 w-4" /> Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange('')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <p className="text-xs">Click or drag an image to upload</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
        disabled={disabled || isUploading}
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
        className="hidden"
      />
    </div>
  )
}
