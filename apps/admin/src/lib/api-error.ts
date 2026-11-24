/** Message of a failed admin API call: the server's `message` (a string or a list of strings), else the given fallback. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string | string[] } } } | null)?.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  return message || fallback
}

/** Admin write endpoints answer either the entity itself or `{ [key]: entity }`; this returns the entity in both cases. */
export function unwrapEntity<T>(data: unknown, key: string): T {
  const wrapped = (data as Record<string, unknown> | null | undefined)?.[key]
  return (wrapped ?? data) as T
}

/** List endpoints answer either an array or `{ items }`. */
export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  return ((data as { items?: T[] } | null | undefined)?.items ?? []) as T[]
}
