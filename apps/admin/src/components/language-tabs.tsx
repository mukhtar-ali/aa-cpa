import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

/**
 * Shared EN/AR tab switcher for bilingual admin forms. Toggle visibility of a
 * language's field block with `l.code === value ? '...' : 'hidden'` rather than
 * unmounting it, so react-hook-form validation state survives a tab switch.
 */
export function LanguageTabs({
  value,
  onValueChange,
  className,
}: {
  value: LanguageCode
  onValueChange: (value: LanguageCode) => void
  className?: string
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as LanguageCode)} className={className ?? 'w-fit'}>
      <TabsList className='h-9'>
        {LANGUAGES.map((l) => (
          <TabsTrigger key={l.code} value={l.code} className='min-w-[3rem]'>
            {l.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
