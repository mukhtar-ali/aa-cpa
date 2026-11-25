import React from 'react'
import { AlertCircle, CheckCircle2, Globe } from 'lucide-react'

export interface SearchSnippetPreviewProps {
  title?: string
  description?: string
  slug?: string
  pathPrefix?: string
  lang?: 'ar' | 'en'
  noindex?: boolean
  baseUrl?: string
}

export function SearchSnippetPreview({
  title = '',
  description = '',
  slug = '',
  pathPrefix = '',
  lang = 'ar',
  noindex = false,
  baseUrl = 'https://aacpa.sa',
}: SearchSnippetPreviewProps) {
  const isRtl = lang === 'ar'
  const cleanTitle = title.trim() || (isRtl ? 'عنوان الصفحة | شركة عبدالرحمن الشبيشيري' : 'Page Title | Abdulrahman Al-Shubaishiri')
  const cleanDesc = description.trim() || (isRtl ? 'أدخل وصفاً للمحتوى يظهر في نتائج محركات البحث لزيادة معدل النقر وجذب الزوار المستهدفين.' : 'Enter a description that will appear in search engine results to improve click-through rates.')

  const titleLen = title.trim().length
  const descLen = description.trim().length

  // Guidelines: Title ≤ 60 chars, Description 120–160 chars
  const titleStatus =
    titleLen === 0
      ? 'empty'
      : titleLen <= 60
        ? 'optimal'
        : 'warning'

  const descStatus =
    descLen === 0
      ? 'empty'
      : descLen >= 120 && descLen <= 160
        ? 'optimal'
        : descLen < 120
          ? 'short'
          : 'warning'

  const formattedPath = [
    baseUrl.replace(/\/+$/, ''),
    lang,
    pathPrefix.replace(/^\/+|\/+$/g, ''),
    slug.replace(/^\/+|\/+$/g, ''),
  ]
    .filter(Boolean)
    .join(' › ')

  return (
    <div className='rounded-lg border bg-card p-4 shadow-sm space-y-3 text-card-foreground'>
      <div className='flex items-center justify-between border-b pb-2 text-xs font-medium text-muted-foreground'>
        <span className='flex items-center gap-1.5'>
          <Globe className='h-3.5 w-3.5' />
          Google Search Snippet Preview ({lang.toUpperCase()})
        </span>
        {noindex && (
          <span className='inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400'>
            <AlertCircle className='h-3 w-3' />
            noindex (Hidden from Search)
          </span>
        )}
      </div>

      {/* Snippet box (Google style) */}
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className='rounded-md border border-muted bg-white p-3.5 text-left font-sans shadow-[0_1px_6px_rgba(32,33,36,0.1)] dark:bg-zinc-900 dark:border-zinc-800'
      >
        <div className='text-xs text-zinc-600 dark:text-zinc-400 truncate mb-1' dir='ltr'>
          {formattedPath}
        </div>
        <div className='text-base font-medium text-[#1a0dab] hover:underline dark:text-[#8ab4f8] leading-snug line-clamp-1'>
          {cleanTitle}
        </div>
        <div className='mt-1 text-xs sm:text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2'>
          {cleanDesc}
        </div>
      </div>

      {/* Character Counters */}
      <div className='grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 text-xs'>
        {/* Title Counter */}
        <div className='flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5'>
          <span className='text-muted-foreground font-medium'>Title:</span>
          <div className='flex items-center gap-1.5 font-mono'>
            <span
              className={
                titleStatus === 'optimal'
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : titleStatus === 'warning'
                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-muted-foreground'
              }
            >
              {titleLen} / 60
            </span>
            {titleStatus === 'optimal' && <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />}
            {titleStatus === 'warning' && (
              <span className='text-[10px] text-amber-600 dark:text-amber-400'>(&gt;60 chars)</span>
            )}
          </div>
        </div>

        {/* Description Counter */}
        <div className='flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5'>
          <span className='text-muted-foreground font-medium'>Description:</span>
          <div className='flex items-center gap-1.5 font-mono'>
            <span
              className={
                descStatus === 'optimal'
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : descStatus === 'short'
                    ? 'text-amber-600 dark:text-amber-400'
                    : descStatus === 'warning'
                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                      : 'text-muted-foreground'
              }
            >
              {descLen} / 120–160
            </span>
            {descStatus === 'optimal' && <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />}
            {descStatus === 'short' && (
              <span className='text-[10px] text-amber-600 dark:text-amber-400'>(&lt;120)</span>
            )}
            {descStatus === 'warning' && (
              <span className='text-[10px] text-rose-600 dark:text-rose-400'>(&gt;160)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
