import type { ComponentType } from 'react'

export const callTypes = new Map<string, string>()

export const allRoles: { label: string; value: string; icon?: ComponentType }[] = []

export const editableRoles: { label: string; value: string; icon?: ComponentType }[] = []

export const roles = editableRoles
