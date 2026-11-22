import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getContactFormSection as getDefaultContactFormSection,
  getContactHeroSection,
  type ContactFormSectionModel,
  type ContactHeroSectionModel,
} from '@repo/shared'
import {
  getContactFormSection,
  getContactHero,
  updateContactFormSection,
  updateContactHero,
} from '@/lib/contact-page-api'

export function useContactPageHero() {
  return useQuery<ContactHeroSectionModel>({
    queryKey: ['contact-page', 'hero'],
    queryFn: () => getContactHero().catch(() => getContactHeroSection()),
  })
}
export function useUpdateContactPageHero() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ContactHeroSectionModel) => updateContactHero(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-page', 'hero'] })
      toast.success('Contact page hero updated successfully')
    },
    onError: () => toast.error('Failed to update contact page hero'),
  })
}

export function useContactPageFormSection() {
  return useQuery<ContactFormSectionModel>({
    queryKey: ['contact-page', 'form'],
    queryFn: () => getContactFormSection().catch(() => getDefaultContactFormSection()),
  })
}
export function useUpdateContactPageFormSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ContactFormSectionModel) => updateContactFormSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-page', 'form'] })
      toast.success('Contact form section updated successfully')
    },
    onError: () => toast.error('Failed to update contact form section'),
  })
}
