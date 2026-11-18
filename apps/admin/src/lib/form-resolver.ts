import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, Resolver } from 'react-hook-form'
import type { z } from 'zod'

/**
 * react-hook-form resolver for a zod schema, typed with the schema's OUTPUT shape.
 *
 * With zod 4, `zodResolver` is typed `Resolver<z.input<S>, any, z.output<S>>`. Schemas with `.default()` /
 * `.optional().default()` fields (most CMS forms) have an input type with those fields optional and an output
 * type where they are required, so `useForm<SomeFormModel>` (the output model) no longer type-checks against it.
 * Every form here is initialised with `defaultValues` built from the full model, so at runtime the form values
 * already have the output shape; typing the resolver that way is accurate, and this one cast replaces a
 * `schema as any` at every call site (which also threw away the schema's type information).
 */
export function formResolver<S extends z.ZodType<FieldValues>>(schema: S): Resolver<z.output<S>> {
  return zodResolver(schema as never) as unknown as Resolver<z.output<S>>
}
