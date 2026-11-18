import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  getDefaultProjectForm,
  ProjectFormSchema,
  type ProjectFormModel,
  type ProjectModel,
} from '@repo/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageUploadField } from '@/components/upload/image-upload-field'
import { LANGUAGES, LanguageTabs } from '@/components/language-tabs'
import { useCreateProject, useUpdateProject } from '../hooks/use-projects'

type ProjectActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ProjectModel | null
}

function toFormValues(project?: ProjectModel | null): ProjectFormModel {
  if (!project) return getDefaultProjectForm()
  return {
    title: project.title,
    subtitle: project.subtitle,
    description: project.description,
    location: project.location,
    tags: (project.tags ?? []).map((tag) => ({
      en: tag.en ?? '',
      ar: tag.ar ?? '',
    })),
    heroMedia: project.heroMedia,
    thumbnail: project.thumbnail ?? '',
    amenities: (project.amenities ?? []).map((amenity) => ({
      icon: amenity.icon ?? '',
      title: {
        en: amenity.title?.en ?? '',
        ar: amenity.title?.ar ?? '',
      },
      description: {
        en: amenity.description?.en ?? '',
        ar: amenity.description?.ar ?? '',
      },
    })),
    isPublished: project.isPublished,
    isFeatured: project.isFeatured,
    slug: project.slug,
  }
}

export function ProjectsActionDialog({ open, onOpenChange, currentRow }: ProjectActionDialogProps) {
  const isEdit = !!currentRow
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  const form = useForm<ProjectFormModel>({
    resolver: formResolver(ProjectFormSchema),
    defaultValues: toFormValues(currentRow),
  })

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control: form.control,
    name: 'tags',
  })

  const {
    fields: amenityFields,
    append: appendAmenity,
    remove: removeAmenity,
  } = useFieldArray({
    control: form.control,
    name: 'amenities',
  })

  useEffect(() => {
    if (open) form.reset(toFormValues(currentRow))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRow])

  const onSubmit = async (values: ProjectFormModel) => {
    const cleanedValues: ProjectFormModel = {
      ...values,
      tags: (values.tags ?? []).filter((tag) => tag.en.trim() !== '' || tag.ar.trim() !== ''),
      amenities: (values.amenities ?? []).filter(
        (amenity) =>
          (amenity.icon ?? '').trim() !== '' ||
          amenity.title.en.trim() !== '' ||
          amenity.title.ar.trim() !== '' ||
          amenity.description.en.trim() !== '' ||
          amenity.description.ar.trim() !== ''
      ),
    }

    try {
      if (isEdit && currentRow) {
        await updateProject.mutateAsync({ id: currentRow.id, data: cleanedValues })
      } else {
        await createProject.mutateAsync(cleanedValues)
      }
      onOpenChange(false)
    } catch {
      // Error handled by mutation hook
    }
  }

  const isLoading = createProject.isPending || updateProject.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the project details below. Content fields support English and Arabic.'
              : 'Create a new project. Content fields support English and Arabic.'}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[65vh] overflow-y-auto px-0.5 py-1'>
          <Form {...form}>
            <form id='project-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <LanguageTabs value={lang} onValueChange={setLang} />

              {LANGUAGES.map((l) => (
                <div key={l.code} className={l.code === lang ? 'space-y-4' : 'hidden'}>
                  <FormField
                    control={form.control}
                    name={`title.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title ({l.label})</FormLabel>
                        <FormControl>
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} placeholder='Project title' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`subtitle.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle ({l.label})</FormLabel>
                        <FormControl>
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} placeholder='Project subtitle' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`location.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location ({l.label})</FormLabel>
                        <FormControl>
                          <Input dir={l.code === 'ar' ? 'rtl' : 'ltr'} placeholder='Location' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`description.${l.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description ({l.label})</FormLabel>
                        <FormControl>
                          <Textarea
                            dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                            rows={4}
                            placeholder='Project description'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <div className='space-y-3 rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium'>Tags</p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => appendTag({ en: '', ar: '' })}
                  >
                    <Plus className='mr-1 h-4 w-4' /> Add tag
                  </Button>
                </div>
                {tagFields.length === 0 && (
                  <p className='text-xs text-muted-foreground'>No tags added.</p>
                )}
                {tagFields.map((item, index) => (
                  <div key={item.id} className='flex items-start gap-2'>
                    {LANGUAGES.map((l) => (
                      <div key={l.code} className={l.code === lang ? 'flex-1' : 'hidden'}>
                        <FormField
                          control={form.control}
                          name={`tags.${index}.${l.code}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                                  placeholder={`Tag (${l.label})`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label={`Remove tag ${index + 1}`}
                      onClick={() => removeTag(index)}
                    >
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </div>
                ))}
              </div>

              <div className='space-y-3 rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium'>Amenities</p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      appendAmenity({
                        icon: '',
                        title: { en: '', ar: '' },
                        description: { en: '', ar: '' },
                      })
                    }
                  >
                    <Plus className='mr-1 h-4 w-4' /> Add amenity
                  </Button>
                </div>
                {amenityFields.length === 0 && (
                  <p className='text-xs text-muted-foreground'>No amenities added.</p>
                )}
                {amenityFields.map((item, index) => (
                  <div key={item.id} className='space-y-3 rounded-md border p-3'>
                    <div className='flex items-center justify-between'>
                      <p className='text-xs font-medium text-muted-foreground'>Amenity {index + 1}</p>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        aria-label={`Remove amenity ${index + 1}`}
                        onClick={() => removeAmenity(index)}
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name={`amenities.${index}.icon`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <FormControl>
                            <Input placeholder='Icon name or URL' {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormDescription>Icon name or URL</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {LANGUAGES.map((l) => (
                      <div key={l.code} className={l.code === lang ? 'space-y-3' : 'hidden'}>
                        <FormField
                          control={form.control}
                          name={`amenities.${index}.title.${l.code}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title ({l.label})</FormLabel>
                              <FormControl>
                                <Input
                                  dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                                  placeholder='Amenity title'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`amenities.${index}.description.${l.code}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description ({l.label})</FormLabel>
                              <FormControl>
                                <Textarea
                                  dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                                  rows={2}
                                  placeholder='Amenity description'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name='slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder='auto-generated from EN title' {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='thumbnail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <ImageUploadField
                        value={field.value ?? undefined}
                        onChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex items-center gap-8'>
                <FormField
                  control={form.control}
                  name='isPublished'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center gap-2'>
                      <FormLabel className='mb-0'>Published</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='isFeatured'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center gap-2'>
                      <FormLabel className='mb-0'>Featured</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='project-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
