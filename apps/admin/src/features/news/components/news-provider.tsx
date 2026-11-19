import React, { useState } from 'react'
import type { NewsModel } from '@repo/shared'
import useDialogState from '@/hooks/use-dialog-state'

type NewsDialogType = 'add' | 'edit' | 'delete'

type NewsContextType = {
  open: NewsDialogType | null
  setOpen: (str: NewsDialogType | null) => void
  currentRow: NewsModel | null
  setCurrentRow: React.Dispatch<React.SetStateAction<NewsModel | null>>
}

const NewsContext = React.createContext<NewsContextType | null>(null)

export function NewsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<NewsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<NewsModel | null>(null)

  return (
    <NewsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </NewsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNewsContext = () => {
  const newsContext = React.useContext(NewsContext)

  if (!newsContext) {
    throw new Error('useNewsContext has to be used within <NewsContext>')
  }

  return newsContext
}
