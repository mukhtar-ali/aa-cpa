import { Badge } from '@/components/ui/badge'

export type LangCompleteness = 'complete' | 'partial' | 'missing'

export interface BilingualValueLike {
  ar?: string | null
  en?: string | null
}

export function computeTranslationStatus(fields: BilingualValueLike[] = []): {
  ar: LangCompleteness
  en: LangCompleteness
} {
  if (!fields || fields.length === 0) {
    return { ar: 'missing', en: 'missing' }
  }

  const checkLang = (lang: 'ar' | 'en'): LangCompleteness => {
    const filled = fields.filter((f) => Boolean(f?.[lang]?.trim())).length
    if (filled === 0) return 'missing'
    if (filled === fields.length) return 'complete'
    return 'partial'
  }

  return {
    ar: checkLang('ar'),
    en: checkLang('en'),
  }
}

export interface TranslationStatusBadgeProps {
  status?: {
    ar: LangCompleteness
    en: LangCompleteness
  }
  fields?: BilingualValueLike[]
}

export function TranslationStatusBadge({ status, fields }: TranslationStatusBadgeProps) {
  const computed = status ?? (fields ? computeTranslationStatus(fields) : { ar: 'missing', en: 'missing' })
  const ar = computed.ar ?? 'missing'
  const en = computed.en ?? 'missing'

  return (
    <div className='inline-flex items-center gap-1.5' data-testid='translation-status-badge'>
      <Badge variant={ar === 'complete' ? 'default' : 'destructive'} className='text-xs'>
        AR: {ar}
      </Badge>
      <Badge
        variant={en === 'complete' ? 'secondary' : 'outline'}
        className='text-xs'
      >
        EN: {en}
      </Badge>
    </div>
  )
}
