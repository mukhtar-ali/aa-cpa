import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export interface MultiLangValue {
  ar: string
  en: string
}

export interface BilingualFieldProps {
  label: string
  name?: string
  namePrefix?: string
  value?: MultiLangValue | null
  onChange: (next: MultiLangValue) => void
  multiline?: boolean
  required?: boolean
  requiredAr?: boolean
  placeholderAr?: string
  placeholderEn?: string
  errorAr?: string
  errorEn?: string
}

export function BilingualField({
  label,
  name,
  namePrefix,
  value,
  onChange,
  multiline = false,
  required = false,
  requiredAr = false,
  placeholderAr = 'أدخل النص بالعربية...',
  placeholderEn = 'Enter English text (optional)...',
  errorAr,
  errorEn,
}: BilingualFieldProps) {
  const prefix = namePrefix || name || 'bilingual'
  const isArRequired = required || requiredAr
  const [activeTab, setActiveTab] = useState<'ar' | 'en'>('ar')
  const current: MultiLangValue = {
    ar: value?.ar ?? '',
    en: value?.en ?? '',
  }

  const handleTextChange = (lang: 'ar' | 'en', text: string) => {
    onChange({
      ...current,
      [lang]: text,
    })
  }

  const FieldComponent = multiline ? Textarea : Input

  return (
    <div className='space-y-2' data-testid={`bilingual-field-${prefix}`}>
      <div className='flex items-center justify-between'>
        <Label className='text-sm font-medium'>
          {label}
          {isArRequired && <span className='ms-1 text-destructive'>*</span>}
        </Label>
        <div className='inline-flex rounded-md border bg-muted p-0.5 text-xs' role='tablist'>
          <button
            type='button'
            role='tab'
            aria-selected={activeTab === 'ar'}
            data-testid={`${prefix}-tab-ar`}
            onClick={() => setActiveTab('ar')}
            className={`rounded px-2.5 py-1 font-medium transition ${
              activeTab === 'ar'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            العربية (AR){isArRequired ? ' *' : ''}
          </button>
          <button
            type='button'
            role='tab'
            aria-selected={activeTab === 'en'}
            data-testid={`${prefix}-tab-en`}
            onClick={() => setActiveTab('en')}
            className={`rounded px-2.5 py-1 font-medium transition ${
              activeTab === 'en'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            English (EN)
          </button>
        </div>
      </div>

      <div className={activeTab === 'ar' ? 'space-y-1' : 'hidden'}>
        <FieldComponent
          dir='rtl'
          aria-label={`${label} (AR)`}
          data-testid={`${prefix}-input-ar`}
          value={current.ar}
          placeholder={placeholderAr}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            handleTextChange('ar', e.target.value)
          }
        />
        {errorAr && (
          <p className='text-xs text-destructive' role='alert'>
            {errorAr}
          </p>
        )}
      </div>

      <div className={activeTab === 'en' ? 'space-y-1' : 'hidden'}>
        <FieldComponent
          dir='ltr'
          aria-label={`${label} (EN)`}
          data-testid={`${prefix}-input-en`}
          value={current.en}
          placeholder={placeholderEn}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            handleTextChange('en', e.target.value)
          }
        />
        {errorEn && (
          <p className='text-xs text-destructive' role='alert'>
            {errorEn}
          </p>
        )}
      </div>
    </div>
  )
}
