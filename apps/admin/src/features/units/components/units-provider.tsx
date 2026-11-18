import React, { useState } from 'react'
import type { UnitModel } from '@repo/shared'
import useDialogState from '@/hooks/use-dialog-state'

type UnitsDialogType = 'add' | 'edit' | 'delete'

type UnitsContextType = {
  projectId: string
  open: UnitsDialogType | null
  setOpen: (str: UnitsDialogType | null) => void
  currentRow: UnitModel | null
  setCurrentRow: React.Dispatch<React.SetStateAction<UnitModel | null>>
}

const UnitsContext = React.createContext<UnitsContextType | null>(null)

export function UnitsProvider({
  projectId,
  children,
}: {
  projectId: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<UnitsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<UnitModel | null>(null)

  return (
    <UnitsContext value={{ projectId, open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UnitsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUnitsContext = () => {
  const unitsContext = React.useContext(UnitsContext)

  if (!unitsContext) {
    throw new Error('useUnitsContext has to be used within <UnitsContext>')
  }

  return unitsContext
}
