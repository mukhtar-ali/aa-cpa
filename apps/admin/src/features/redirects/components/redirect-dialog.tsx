import React, { useState } from 'react'
import {
    RedirectFormSchema,
    type RedirectAdmin,
    type RedirectForm,
} from '@repo/shared'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface RedirectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    redirect?: RedirectAdmin | null
    onSave: (data: RedirectForm) => Promise<void>
}

export function RedirectDialog({
    open,
    onOpenChange,
    redirect,
    onSave,
}: RedirectDialogProps) {
    // The parent remounts this dialog (key) for every open, so the initial values come straight from the props.
    const [fromPath, setFromPath] = useState(redirect?.fromPath ?? '')
    const [toPath, setToPath] = useState(redirect?.toPath ?? '')
    const [type, setType] = useState<'permanent' | 'temporary'>(redirect?.type ?? 'permanent')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSaving, setIsSaving] = useState(false)


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        const payload: RedirectForm = {
            fromPath,
            toPath,
            type,
            source: redirect?.source || 'manual',
        }

        const parsed = RedirectFormSchema.safeParse(payload)
        if (!parsed.success) {
            const nextErrors: Record<string, string> = {}
            for (const issue of parsed.error.issues) {
                nextErrors[issue.path.join('.')] = issue.message
            }
            setErrors(nextErrors)
            return
        }

        try {
            setIsSaving(true)
            await onSave(parsed.data)
            onOpenChange(false)
        } catch (err) {
            const e = err as { response?: { data?: { message?: string | string[] } }; message?: string }
            const msg = e.response?.data?.message || e.message || 'Failed to save redirect.'
            setErrors({ root: Array.isArray(msg) ? msg.join(', ') : msg })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {redirect ? 'Edit Redirect' : 'Add New Redirect'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure URL redirection. From path must be a relative path (e.g. /old-page). Target can be internal or external.
                        </DialogDescription>
                    </DialogHeader>

                    {errors.root && (
                        <div className="my-2 p-3 text-sm rounded bg-destructive/15 text-destructive">
                            {errors.root}
                        </div>
                    )}

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fromPath">Source Path (From)</Label>
                            <Input
                                id="fromPath"
                                placeholder="/services/old-audit"
                                value={fromPath}
                                onChange={(e) => setFromPath(e.target.value)}
                                disabled={isSaving}
                            />
                            {errors.fromPath && (
                                <p className="text-xs text-destructive">{errors.fromPath}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="toPath">Target Path or URL (To)</Label>
                            <Input
                                id="toPath"
                                placeholder="/services/external-audit"
                                value={toPath}
                                onChange={(e) => setToPath(e.target.value)}
                                disabled={isSaving}
                            />
                            {errors.toPath && (
                                <p className="text-xs text-destructive">{errors.toPath}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Redirect Type</Label>
                            <Select
                                value={type}
                                onValueChange={(val: 'permanent' | 'temporary') => setType(val)}
                                disabled={isSaving}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="permanent">Permanent (308)</SelectItem>
                                    <SelectItem value="temporary">Temporary (307)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-xs text-destructive">{errors.type}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : redirect ? 'Update Redirect' : 'Create Redirect'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
