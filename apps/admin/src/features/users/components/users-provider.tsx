import React, { useState } from 'react'
import type { AdminViewUserModel } from '@repo/shared'
import useDialogState from '@/hooks/use-dialog-state'

type UsersDialogType = 'add' | 'delete' | 'permissions' | 'status'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: AdminViewUserModel | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminViewUserModel | null>>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminViewUserModel | null>(null)

  return (
    <UsersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
