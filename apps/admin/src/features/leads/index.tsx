import { useState } from 'react'
import { type LeadAdmin, type LeadStatus } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface LeadsFeatureProps {
  initialLeads?: LeadAdmin[]
  onStatusChange?: (id: string, status: LeadStatus) => Promise<void> | void
  onAddNote?: (id: string, body: string) => Promise<void> | void
  onPrivacyExport?: (email: string) => Promise<void> | void
  onPrivacyErase?: (email: string) => Promise<void> | void
}

export function Leads({
  initialLeads = [],
  onStatusChange,
  onAddNote,
  onPrivacyExport,
  onPrivacyErase,
}: LeadsFeatureProps) {
  const [leads, setLeads] = useState<LeadAdmin[]>(initialLeads)
  const [noteText, setNoteText] = useState<Record<string, string>>({})
  const [privacyEmail, setPrivacyEmail] = useState('')

  return (
    <div className='space-y-6 p-4' data-testid='leads-feature'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Leads & Contact Requests</h1>
        <Button asChild variant='outline'>
          <a href='/api/admin/leads/export.csv' data-testid='export-leads-csv'>
            Export CSV
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Leads</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {leads.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No leads found.</p>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                data-testid={`lead-row-${lead.id}`}
                className='space-y-2 rounded-md border p-4'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-semibold'>{lead.fullName}</p>
                    <p className='text-xs text-muted-foreground'>
                      {lead.email} · {lead.mobile} · Source: {lead.source}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge>{lead.status}</Badge>
                    <select
                      aria-label={`Status for ${lead.id}`}
                      data-testid={`lead-status-select-${lead.id}`}
                      value={lead.status}
                      className='rounded border px-2 py-1 text-xs'
                      onChange={(e) => {
                        const nextStatus = e.target.value as LeadStatus
                        setLeads(
                          leads.map((l) =>
                            l.id === lead.id ? { ...l, status: nextStatus } : l
                          )
                        )
                        void onStatusChange?.(lead.id, nextStatus)
                      }}
                    >
                      <option value='new'>New</option>
                      <option value='contacted'>Contacted</option>
                      <option value='qualified'>Qualified</option>
                      <option value='closed'>Closed</option>
                      <option value='spam'>Spam</option>
                    </select>
                  </div>
                </div>
                {lead.message && <p className='text-sm'>{lead.message}</p>}
                <div className='flex gap-2'>
                  <Input
                    placeholder='Add internal note...'
                    data-testid={`lead-note-input-${lead.id}`}
                    value={noteText[lead.id] ?? ''}
                    onChange={(e) =>
                      setNoteText({ ...noteText, [lead.id]: e.target.value })
                    }
                  />
                  <Button
                    type='button'
                    size='sm'
                    data-testid={`lead-note-submit-${lead.id}`}
                    onClick={() => {
                      const body = noteText[lead.id]?.trim()
                      if (!body) return
                      void onAddNote?.(lead.id, body)
                      setNoteText({ ...noteText, [lead.id]: '' })
                    }}
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PDPL Data Subject Rights (Export / Erase)</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex gap-2'>
            <Input
              type='email'
              placeholder='Data subject email...'
              data-testid='pdpl-email-input'
              value={privacyEmail}
              onChange={(e) => setPrivacyEmail(e.target.value)}
            />
            <Button
              type='button'
              variant='secondary'
              data-testid='pdpl-export-btn'
              onClick={() => privacyEmail && void onPrivacyExport?.(privacyEmail)}
            >
              Export JSON
            </Button>
            <Button
              type='button'
              variant='destructive'
              data-testid='pdpl-erase-btn'
              onClick={() => privacyEmail && void onPrivacyErase?.(privacyEmail)}
            >
              Erase Subject Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
