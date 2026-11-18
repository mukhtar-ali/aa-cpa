import React, { useState } from 'react'
import type { InquiryModel } from '@repo/shared'
import useDialogState from '@/hooks/use-dialog-state'

type InquiriesDialogType = 'delete'

type InquiriesContextType = {
  open: InquiriesDialogType | null
  setOpen: (str: InquiriesDialogType | null) => void
  currentRow: InquiryModel | null
  setCurrentRow: React.Dispatch<React.SetStateAction<InquiryModel | null>>
}

const InquiriesContext = React.createContext<InquiriesContextType | null>(null)

export function InquiriesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<InquiriesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<InquiryModel | null>(null)

  return (
    <InquiriesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </InquiriesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useInquiriesContext = () => {
  const ctx = React.useContext(InquiriesContext)
  if (!ctx) throw new Error('useInquiriesContext must be used within <InquiriesProvider>')
  return ctx
}
