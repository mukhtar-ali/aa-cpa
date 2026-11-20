import React, { useState } from 'react'
import { JobDepartmentFormSchema, type JobDepartmentFormModel } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BilingualField } from '@/components/cms'

export function JobDepartments({
  onSave,
}: {
  onSave?: (data: JobDepartmentFormModel) => Promise<void> | void
}) {
  const [form, setForm] = useState<JobDepartmentFormModel>({
    slug: '',
    name: { ar: '', en: '' },
    order: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = JobDepartmentFormSchema.safeParse(form)
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
    <div className='space-y-6 p-4' data-testid='job-departments-feature'>
      <h1 className='text-2xl font-bold'>Job Departments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Department Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1'>
              <Label htmlFor='dept-slug'>Slug *</Label>
              <Input
                id='dept-slug'
                data-testid='dept-slug-input'
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
              label='Department Name'
              namePrefix='dept-name'
              requiredAr
              value={form.name}
              onChange={(name) => setForm({ ...form, name })}
            />
            <Button type='submit' data-testid='dept-submit-btn'>
              Save Department
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export { JobDepartments as JobDepartmentsFeature }
