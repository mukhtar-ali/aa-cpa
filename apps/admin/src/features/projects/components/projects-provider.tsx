import React, { useState } from 'react'
import type { ProjectModel } from '@repo/shared'
import useDialogState from '@/hooks/use-dialog-state'

type ProjectsDialogType = 'add' | 'edit' | 'delete'

type ProjectsContextType = {
  open: ProjectsDialogType | null
  setOpen: (str: ProjectsDialogType | null) => void
  currentRow: ProjectModel | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ProjectModel | null>>
}

const ProjectsContext = React.createContext<ProjectsContextType | null>(null)

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ProjectsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ProjectModel | null>(null)

  return (
    <ProjectsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProjectsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProjectsContext = () => {
  const projectsContext = React.useContext(ProjectsContext)

  if (!projectsContext) {
    throw new Error('useProjectsContext has to be used within <ProjectsContext>')
  }

  return projectsContext
}
