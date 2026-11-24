import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Plus,
    Upload,
    Download,
    Pencil,
    Trash2,
    Search,
    ArrowRightLeft,
} from 'lucide-react'
import {
    type RedirectAdmin,
    type RedirectFilter,
    type RedirectForm,
} from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { redirectsApi } from './api'
import { RedirectDialog } from './components/redirect-dialog'
import { RedirectImportDialog } from './components/redirect-import-dialog'

export function Redirects() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [sourceFilter, setSourceFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')

    // Dialogs state
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogSession, setDialogSession] = useState(0)
    const [editingItem, setEditingItem] = useState<RedirectAdmin | null>(null)
    const [isImportOpen, setIsImportOpen] = useState(false)

    const { data, isFetching: isLoading } = useQuery({
        queryKey: ['redirects', page, pageSize, appliedSearch, sourceFilter, typeFilter],
        queryFn: () =>
            redirectsApi.list({
                pageNumber: page,
                pageSize,
                search: appliedSearch || undefined,
                source: sourceFilter !== 'all' ? (sourceFilter as RedirectFilter['source']) : undefined,
                type: typeFilter !== 'all' ? (typeFilter as RedirectFilter['type']) : undefined,
            }),
    })
    const items: RedirectAdmin[] = data?.items ?? []
    const total = data?.total ?? 0
    const fetchRedirects = () => queryClient.invalidateQueries({ queryKey: ['redirects'] })

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        setAppliedSearch(search)
    }

    const handleSave = async (data: RedirectForm) => {
        if (editingItem) {
            await redirectsApi.update(editingItem.id, data)
        } else {
            await redirectsApi.create(data)
        }
        await fetchRedirects()
    }

    const handleDelete = async (id: string, fromPath: string) => {
        if (!window.confirm(`Are you sure you want to delete redirect "${fromPath}"?`)) {
            return
        }
        try {
            await redirectsApi.delete(id)
            await fetchRedirects()
        } catch (err) {
            console.error('Failed to delete redirect:', err)
            alert('Failed to delete redirect.')
        }
    }

    const handleExport = async () => {
        try {
            const blob = await redirectsApi.exportCsv()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'redirects.csv'
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Failed to export CSV:', err)
            alert('Failed to export redirects CSV.')
        }
    }

    const totalPages = Math.ceil(total / pageSize) || 1

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ArrowRightLeft className="h-7 w-7 text-primary" />
                        Redirects Manager
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Manage 308 permanent and 307 temporary redirects, legacy URL mappings, and CSV import/export.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import CSV
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            setEditingItem(null)
                            setDialogSession((n) => n + 1)
                            setIsDialogOpen(true)
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Redirect
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Redirect Rules ({total})</CardTitle>
                    <CardDescription>
                        All redirects are cached at the edge and resolved by the Next.js web proxy.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters & Search */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by from or to path..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="secondary" size="sm">
                                Search
                            </Button>
                        </form>

                        <div className="flex gap-2">
                            <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setPage(1); }}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="permanent">Permanent (308)</SelectItem>
                                    <SelectItem value="temporary">Temporary (307)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sourceFilter} onValueChange={(val) => { setSourceFilter(val); setPage(1); }}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sources</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="legacy_import">Legacy Import</SelectItem>
                                    <SelectItem value="slug_change">Slug Change</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Source Path (From)</TableHead>
                                    <TableHead className="w-[30%]">Target (To)</TableHead>
                                    <TableHead className="w-[12%]">Type</TableHead>
                                    <TableHead className="w-[12%]">Source</TableHead>
                                    <TableHead className="w-[8%] text-center">Hits</TableHead>
                                    <TableHead className="w-[8%] text-end">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Loading redirects...
                                        </TableCell>
                                    </TableRow>
                                ) : items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No redirects found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-xs font-semibold">
                                                {item.fromPath}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {item.toPath}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.type === 'permanent' ? 'default' : 'secondary'}>
                                                    {item.type === 'permanent' ? '308 Permanent' : '307 Temporary'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {item.source === 'legacy_import'
                                                        ? 'Legacy'
                                                        : item.source === 'slug_change'
                                                        ? 'Slug Change'
                                                        : 'Manual'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-xs">
                                                {item.hits}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEditingItem(item)
                                                            setDialogSession((n) => n + 1)
                                                            setIsDialogOpen(true)
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(item.id, item.fromPath)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="text-xs text-muted-foreground">
                                Showing page {page} of {totalPages} ({total} items)
                            </div>
                            <div className="space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1 || isLoading}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages || isLoading}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <RedirectDialog
                key={dialogSession}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                redirect={editingItem}
                onSave={handleSave}
            />

            <RedirectImportDialog
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                onImport={redirectsApi.importCsv}
                onSuccess={() => {
                    setPage(1)
                    fetchRedirects()
                }}
            />
        </div>
    )
}
