import React, { useState } from 'react'
import { ArticleCategoryFormSchema, type ArticleCategoryFormModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BilingualField } from '@/components/cms'

export function ArticleCategories({
  onSave,
}: {
  onSave?: (data: ArticleCategoryFormModel) => Promise<void> | void
}) {
  const [form, setForm] = useState<ArticleCategoryFormModel>({
    slug: '',
    name: { ar: '', en: '' },
    order: 0,
    isCaseStory: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = ArticleCategoryFormSchema.safeParse(form)
    if (!parsed.success) {
      const nextErr: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        nextErr[issue.path.join('.')] = issue.message
      }
      setErrors(nextErr)
      return
    }
    setErrors({})
    await onSave?.(parsed.data)
  }

  return (
    <div className='space-y-6 p-4' data-testid='article-categories-feature'>
      <h1 className='text-2xl font-bold'>Article Categories</h1>
      <Card>
        <CardHeader>
          <CardTitle>Category Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1'>
              <Label htmlFor='cat-slug'>Slug *</Label>
              <Input
                id='cat-slug'
                data-testid='category-slug-input'
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
              {errors['slug'] && (
                <p className='text-xs text-destructive' role='alert'>
                  {errors['slug']}
                </p>
              )}
            </div>
            <BilingualField
              label='Category Name'
              namePrefix='category-name'
              requiredAr
              value={form.name}
              onChange={(name) => setForm({ ...form, name })}
            />
            <Button type='submit' data-testid='category-submit-btn'>
              Save Category
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
