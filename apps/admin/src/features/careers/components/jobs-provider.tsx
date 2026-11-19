import React, { useState } from 'react'
import type { JobModel } from '@repo/shared'
import useDialogState from '@/hooks/use-dialog-state'

type JobsDialogType = 'add' | 'edit' | 'delete'

type JobsContextType = {
  open: JobsDialogType | null
  setOpen: (str: JobsDialogType | null) => void
  currentRow: JobModel | null
  setCurrentRow: React.Dispatch<React.SetStateAction<JobModel | null>>
}

const JobsContext = React.createContext<JobsContextType | null>(null)

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<JobsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<JobModel | null>(null)

  return (
    <JobsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </JobsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useJobsContext = () => {
  const jobsContext = React.useContext(JobsContext)

  if (!jobsContext) {
    throw new Error('useJobsContext has to be used within <JobsContext>')
  }

  return jobsContext
}
