import React, { useState } from 'react'
import { AuthorFormSchema, type AuthorFormModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BilingualField } from '@/components/cms'

export function Authors({
  onSave,
}: {
  onSave?: (data: AuthorFormModel) => Promise<void> | void
}) {
  const [form, setForm] = useState<AuthorFormModel>({
    name: { ar: '', en: '' },
    role: { ar: '', en: '' },
    bio: { ar: '', en: '' },
    avatar: null,
    order: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = AuthorFormSchema.safeParse(form)
    if (!parsed.success) return
    await onSave?.(parsed.data)
  }

  return (
    <div className='space-y-6 p-4' data-testid='authors-feature'>
      <h1 className='text-2xl font-bold'>Authors</h1>
      <Card>
        <CardHeader>
          <CardTitle>Author Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <BilingualField
              label='Author Name'
              namePrefix='author-name'
              requiredAr
              value={form.name}
              onChange={(name) => setForm({ ...form, name })}
            />
            <BilingualField
              label='Author Role'
              namePrefix='author-role'
              value={form.role}
              onChange={(role) => setForm({ ...form, role })}
            />
            <Button type='submit' data-testid='author-submit-btn'>
              Save Author
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export { Authors as AuthorsFeature }
