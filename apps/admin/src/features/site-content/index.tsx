import React, { useState } from 'react'
import { OfficeFormSchema, FaqItemFormSchema, type OfficeForm, type FaqItemForm } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BilingualField } from '@/components/cms'

export function SiteContent({
  onSaveOffice,
  onSaveFaq,
}: {
  onSaveOffice?: (data: OfficeForm) => Promise<void> | void
  onSaveFaq?: (data: FaqItemForm) => Promise<void> | void
}) {
  const [office, setOffice] = useState<OfficeForm>({
    city: { ar: '', en: '' },
    address: { ar: '', en: '' },
    mapUrl: '',
    mapX: 50,
    mapY: 50,
    image: null,
    isHeadquarters: false,
    order: 0,
    isPublished: true,
  })
  const [faq, setFaq] = useState<FaqItemForm>({
    question: { ar: '', en: '' },
    answer: { ar: '', en: '' },
    scope: 'global',
    serviceId: null,
    order: 0,
    isPublished: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleOfficeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = OfficeFormSchema.safeParse(office)
    if (!parsed.success) {
      const nextErr: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        nextErr[`office.${issue.path.join('.')}`] = issue.message
      }
      setErrors(nextErr)
      return
    }
    setErrors({})
    await onSaveOffice?.(parsed.data)
  }

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = FaqItemFormSchema.safeParse(faq)
    if (!parsed.success) {
      const nextErr: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        nextErr[`faq.${issue.path.join('.')}`] = issue.message
      }
      setErrors(nextErr)
      return
    }
    setErrors({})
    await onSaveFaq?.(parsed.data)
  }

  return (
    <div className='space-y-6 p-4' data-testid='site-content-feature'>
      <h1 className='text-2xl font-bold'>Site Content & Reference</h1>

      <Card>
        <CardHeader>
          <CardTitle>Offices</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOfficeSubmit} className='space-y-4' data-testid='office-form'>
            <BilingualField
              label='Office City'
              namePrefix='office-city'
              requiredAr
              value={office.city}
              errorAr={errors['office.city.ar']}
              onChange={(city) => setOffice({ ...office, city })}
            />
            <BilingualField
              label='Office Address'
              namePrefix='office-address'
              value={office.address}
              onChange={(address) => setOffice({ ...office, address })}
            />
            <Button type='submit' data-testid='office-submit-btn'>
              Save Office
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ Items</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFaqSubmit} className='space-y-4' data-testid='faq-form'>
            <BilingualField
              label='Question'
              namePrefix='faq-question'
              requiredAr
              value={faq.question}
              errorAr={errors['faq.question.ar']}
              onChange={(question) => setFaq({ ...faq, question })}
            />
            <BilingualField
              label='Answer'
              namePrefix='faq-answer'
              multiline
              value={faq.answer}
              onChange={(answer) => setFaq({ ...faq, answer })}
            />
            <Button type='submit' data-testid='faq-submit-btn'>
              Save FAQ
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
