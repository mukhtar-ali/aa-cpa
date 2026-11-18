import { useEffect, useState } from 'react'
import { useFieldArray, useForm, useWatch, type Control } from 'react-hook-form'
import { formResolver } from '@/lib/form-resolver'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  getDefaultUnit,
  getImageOrVideoResponsiveDefault,
  MediaType,
  UnitFormSchema,
  type UnitFormModel,
  type UnitModel,
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploadField } from '@/components/upload/image-upload-field'
import { LANGUAGES, LanguageTabs } from '@/components/language-tabs'
import { ResponsiveImageField } from '@/features/about-page/components/responsive-image-field'
import { useCreateUnit, useUpdateUnit } from '../hooks/use-units'
import { useUnitsContext } from './units-provider'

type UnitActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: UnitModel | null
}

function toFormValues(unit?: UnitModel | null): UnitFormModel {
  if (!unit) {
    const { id: _id, ...defaults } = getDefaultUnit()
    void _id
    return defaults
  }
  return {
    title: { en: unit.title?.en ?? '', ar: unit.title?.ar ?? '' },
    type: { en: unit.type?.en ?? '', ar: unit.type?.ar ?? '' },
    area: { en: unit.area?.en ?? '', ar: unit.area?.ar ?? '' },
    view: { en: unit.view?.en ?? '', ar: unit.view?.ar ?? '' },
    delivery: { en: unit.delivery?.en ?? '', ar: unit.delivery?.ar ?? '' },
    status: { en: unit.status?.en ?? '', ar: unit.status?.ar ?? '' },
    floor: { en: unit.floor?.en ?? '', ar: unit.floor?.ar ?? '' },
    building: { en: unit.building?.en ?? '', ar: unit.building?.ar ?? '' },
    overViewTitle: { en: unit.overViewTitle?.en ?? '', ar: unit.overViewTitle?.ar ?? '' },
    overViewDescription: {
      en: unit.overViewDescription?.en ?? '',
      ar: unit.overViewDescription?.ar ?? '',
    },
    overViewFeatures: (unit.overViewFeatures ?? []).map((feature) => ({
      en: feature.en ?? '',
      ar: feature.ar ?? '',
    })),
    thumbnail: unit.thumbnail ?? '',
    overViewImage: unit.overViewImage ?? '',
    price: unit.price ?? '',
    pricePerMeter: unit.pricePerMeter ?? '',
    gallery: (unit.gallery ?? []).map((item) => ({
      image: {
        desktop: item.image?.desktop ?? '',
        tablet: item.image?.tablet ?? '',
        mobile: item.image?.mobile ?? '',
      },
      video: {
        desktop: item.video?.desktop ?? '',
        tablet: item.video?.tablet ?? '',
        mobile: item.video?.mobile ?? '',
      },
      mediaType: item.mediaType ?? MediaType.Image,
    })),
    isPublished: unit.isPublished ?? false,
    slug: unit.slug ?? '',
    bedrooms: unit.bedrooms ?? 0,
    bathrooms: unit.bathrooms ?? 0,
  }
}

function GalleryItemField({
  control,
  index,
  disabled,
  onRemove,
}: {
  control: Control<UnitFormModel>
  index: number
  disabled: boolean
  onRemove: () => void
}) {
  const mediaType = useWatch({ control, name: `gallery.${index}.mediaType` })

  return (
    <div className='space-y-3 rounded-md border p-3'>
      <div className='flex items-center justify-between'>
        <p className='text-xs font-medium text-muted-foreground'>Gallery item {index + 1}</p>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label={`Remove gallery item ${index + 1}`}
          onClick={onRemove}
        >
          <Trash2 className='h-4 w-4 text-destructive' />
        </Button>
      </div>

      <FormField
        control={control}
        name={`gallery.${index}.mediaType`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Media type</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={MediaType.Image}>Image</SelectItem>
                <SelectItem value={MediaType.Video}>Video</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {mediaType === MediaType.Video ? (
        <FormField
          control={control}
          name={`gallery.${index}.video`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input
                  placeholder='https://...'
                  value={field.value?.desktop ?? ''}
                  onChange={(e) => {
                    const url = e.target.value
                    field.onChange({ desktop: url, tablet: url, mobile: url })
                  }}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={control}
          name={`gallery.${index}.image`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ResponsiveImageField
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

export function UnitsActionDialog({ open, onOpenChange, currentRow }: UnitActionDialogProps) {
  const { projectId } = useUnitsContext()
  const isEdit = !!currentRow
  const createUnit = useCreateUnit()
  const updateUnit = useUpdateUnit()
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  const form = useForm<UnitFormModel>({
    resolver: formResolver(UnitFormSchema),
    defaultValues: toFormValues(currentRow),
  })

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control: form.control,
    name: 'overViewFeatures',
  })

  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery,
  } = useFieldArray({
    control: form.control,
    name: 'gallery',
  })

  useEffect(() => {
    if (open) form.reset(toFormValues(currentRow))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRow])

  const onSubmit = async (values: UnitFormModel) => {
    const cleanedValues: UnitFormModel = {
      ...values,
      overViewFeatures: (values.overViewFeatures ?? []).filter(
        (feature) => feature.en.trim() !== '' || feature.ar.trim() !== ''
      ),
    }

    try {
      if (isEdit && currentRow) {
        await updateUnit.mutateAsync({ id: currentRow.id, data: cleanedValues })
      } else {
        await createUnit.mutateAsync({ projectId, data: cleanedValues })
      }
      onOpenChange(false)
    } catch {
      // Error handled by mutation hook
    }
  }

  const isLoading = createUnit.isPending || updateUnit.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Unit' : 'Add New Unit'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the unit details below. Content fields support English and Arabic.'
              : 'Create a new unit for this project. Content fields support English and Arabic.'}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[65vh] overflow-y-auto px-0.5 py-1'>
          <Form {...form}>
            <form id='unit-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <LanguageTabs value={lang} onValueChange={setLang} />

              {/* Basics */}
              <div className='space-y-3 rounded-md border p-3'>
                <p className='text-sm font-medium'>Basics</p>
                {LANGUAGES.map((l) => (
                  <div key={l.code} className={l.code === lang ? 'space-y-3' : 'hidden'}>
                    <FormField
                      control={form.control}
                      name={`title.${l.code}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title ({l.label})</FormLabel>
                          <FormControl>
                            <Input
                              dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                              placeholder='Unit title'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name={`type.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type ({l.label})</FormLabel>
                            <FormControl>
                              <Input
                                dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                                placeholder='Apartment, Villa...'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`status.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status ({l.label})</FormLabel>
                            <FormControl>
                              <Input
                                dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                                placeholder='Available, Sold...'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='slug'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='auto-generated from EN title'
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='price'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g. 2,500,000' {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='pricePerMeter'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per meter</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g. 25,000' {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
              </div>

              {/* Details */}
              <div className='space-y-3 rounded-md border p-3'>
                <p className='text-sm font-medium'>Details</p>
                {LANGUAGES.map((l) => (
                  <div key={l.code} className={l.code === lang ? 'space-y-3' : 'hidden'}>
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name={`area.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Area ({l.label})</FormLabel>
                            <FormControl>
                              <Input
                                dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                                placeholder='e.g. 150 sqm'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`view.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>View ({l.label})</FormLabel>
                            <FormControl>
                              <Input
                                dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                                placeholder='e.g. Garden view'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`delivery.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery ({l.label})</FormLabel>
                            <FormControl>
                              <Input
                                dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                                placeholder='e.g. 2027'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`floor.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floor ({l.label})</FormLabel>
                            <FormControl>
                              <Input
                                dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                                placeholder='e.g. 3rd floor'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`building.${l.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Building ({l.label})</FormLabel>
                            <FormControl>
                              <Input
                                dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                                placeholder='e.g. Building A'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='bedrooms'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='bathrooms'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Overview */}
              <div className='space-y-3 rounded-md border p-3'>
                <p className='text-sm font-medium'>Overview</p>
                {LANGUAGES.map((l) => (
                  <div key={l.code} className={l.code === lang ? 'space-y-3' : 'hidden'}>
                    <FormField
                      control={form.control}
                      name={`overViewTitle.${l.code}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overview Title ({l.label})</FormLabel>
                          <FormControl>
                            <Input
                              dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                              placeholder='Overview section title'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`overViewDescription.${l.code}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overview Description ({l.label})</FormLabel>
                          <FormControl>
                            <Textarea
                              dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                              rows={3}
                              placeholder='Overview description'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <div className='space-y-2 pt-1'>
                  <div className='flex items-center justify-between'>
                    <p className='text-xs font-medium text-muted-foreground'>Overview Features</p>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => appendFeature({ en: '', ar: '' })}
                    >
                      <Plus className='mr-1 h-4 w-4' /> Add feature
                    </Button>
                  </div>
                  {featureFields.length === 0 && (
                    <p className='text-xs text-muted-foreground'>No overview features added.</p>
                  )}
                  {featureFields.map((item, index) => (
                    <div key={item.id} className='flex items-start gap-2'>
                      {LANGUAGES.map((l) => (
                        <div key={l.code} className={l.code === lang ? 'flex-1' : 'hidden'}>
                          <FormField
                            control={form.control}
                            name={`overViewFeatures.${index}.${l.code}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    dir={l.code === 'ar' ? 'rtl' : 'ltr'}
                                    placeholder={`Feature (${l.label})`}
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
                        aria-label={`Remove feature ${index + 1}`}
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media */}
              <div className='space-y-3 rounded-md border p-3'>
                <p className='text-sm font-medium'>Media</p>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
                  <FormField
                    control={form.control}
                    name='overViewImage'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overview Image</FormLabel>
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
                </div>

                <div className='space-y-3 pt-2'>
                  <div className='flex items-center justify-between'>
                    <p className='text-xs font-medium text-muted-foreground'>Gallery</p>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => appendGallery(getImageOrVideoResponsiveDefault())}
                    >
                      <Plus className='mr-1 h-4 w-4' /> Add gallery item
                    </Button>
                  </div>
                  {galleryFields.length === 0 && (
                    <p className='text-xs text-muted-foreground'>No gallery items added.</p>
                  )}
                  {galleryFields.map((item, index) => (
                    <GalleryItemField
                      key={item.id}
                      control={form.control}
                      index={index}
                      disabled={isLoading}
                      onRemove={() => removeGallery(index)}
                    />
                  ))}
                </div>
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='unit-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
