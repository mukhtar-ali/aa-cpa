import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface RedirectImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImport: (file: File) => Promise<{ imported: number; total: number }>
    onSuccess: () => void
}

interface RowError {
    row: number
    message: string
}

export function RedirectImportDialog({
    open,
    onOpenChange,
    onImport,
    onSuccess,
}: RedirectImportDialogProps) {
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [generalError, setGeneralError] = useState<string | null>(null)
    const [rowErrors, setRowErrors] = useState<RowError[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null
        setFile(selected)
        setGeneralError(null)
        setRowErrors([])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            setGeneralError('Please select a CSV file to import.')
            return
        }

        try {
            setIsUploading(true)
            setGeneralError(null)
            setRowErrors([])

            await onImport(file)
            onSuccess()
            onOpenChange(false)
            setFile(null)
        } catch (err) {
            const e = err as { message?: string; response?: { data?: { errors?: unknown; message?: string | string[] } } }
            const data = e.response?.data
            const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
            if (data?.errors && Array.isArray(data.errors)) {
                setRowErrors(data.errors)
                setGeneralError(message || 'Validation failed on CSV rows.')
            } else {
                setGeneralError(message || e.message || 'Failed to import CSV.')
            }
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Import Redirects from CSV</DialogTitle>
                        <DialogDescription>
                            Upload a CSV file with columns <code>from,to,type</code> (e.g. <code>/old-path,/new-path,permanent</code>). All-or-nothing validation with loop detection. Max 5,000 rows.
                        </DialogDescription>
                    </DialogHeader>

                    {generalError && (
                        <div className="my-2 p-3 text-sm rounded bg-destructive/15 text-destructive">
                            {generalError}
                        </div>
                    )}

                    {rowErrors.length > 0 && (
                        <div className="my-2 border border-destructive/20 rounded-md">
                            <div className="p-2 bg-destructive/10 text-xs font-semibold text-destructive">
                                Found {rowErrors.length} row error(s). Please fix the CSV and re-upload:
                            </div>
                            <ScrollArea className="h-44 p-2">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-muted-foreground border-b">
                                            <th className="text-start pb-1 w-16">Row</th>
                                            <th className="text-start pb-1">Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rowErrors.map((err, i) => (
                                            <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="py-1 font-mono font-medium">{err.row}</td>
                                                <td className="py-1 text-destructive">{err.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </ScrollArea>
                        </div>
                    )}

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="csvFile">CSV File</Label>
                            <Input
                                id="csvFile"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: <code>from,to,type</code> (type can be <code>permanent</code> or <code>temporary</code>)
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!file || isUploading}>
                            {isUploading ? 'Importing...' : 'Upload & Import'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
