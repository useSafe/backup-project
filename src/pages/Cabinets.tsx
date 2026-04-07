import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { addShelf, updateShelf, deleteShelf } from '@/lib/storage';
import { Shelf } from '@/types/procurement';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const ITEMS_PER_PAGE = 10;

const Cabinets: React.FC = () => {
    const [searchParams] = useSearchParams();
    const shelfIdFromUrl = searchParams.get('shelfId');

    const { shelves, cabinets, folders, procurements } = useData();

    // UI State
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentCabinet, setCurrentCabinet] = useState<Shelf | null>(null);

    // Filter & Sort
    const [filterShelfId, setFilterShelfId] = useState<string>(shelfIdFromUrl || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<'name' | 'code' | 'contents'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Bulk Selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [parentShelfId, setParentShelfId] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (shelfIdFromUrl) setFilterShelfId(shelfIdFromUrl);
    }, [shelfIdFromUrl]);

    const resetForm = () => {
        setName(''); setCode(''); setParentShelfId(''); setDescription('');
        setCurrentCabinet(null);
    };

    const handleAdd = async () => {
        if (!name || !code || !parentShelfId) { toast.error('Name, Code, and Parent Drawer are required'); return; }
        try {
            await addShelf(parentShelfId, name, code, description);
            setIsAddDialogOpen(false);
            resetForm();
            toast.success('Cabinet added successfully');
        } catch { toast.error('Failed to add cabinet'); }
    };

    const handleEditClick = (cabinet: Shelf) => {
        setCurrentCabinet(cabinet);
        setName(cabinet.name);
        setCode(cabinet.code);
        setParentShelfId(cabinet.cabinetId);
        setDescription(cabinet.description || '');
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!currentCabinet || !name || !code || !parentShelfId) return;
        try {
            await updateShelf(currentCabinet.id, { cabinetId: parentShelfId, name, code, description });
            setIsEditDialogOpen(false);
            resetForm();
            toast.success('Cabinet updated successfully');
        } catch { toast.error('Failed to update cabinet'); }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteShelf(id);
            toast.success('Cabinet deleted successfully');
            setSelectedIds(prev => prev.filter(s => s !== id));
        } catch { toast.error('Failed to delete cabinet'); }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const withContents = selectedIds.filter(id => {
            const s = getCabinetStats(id);
            return s.folders > 0 || s.files > 0;
        });
        if (withContents.length > 0) {
            toast.error(`Cannot delete ${withContents.length} cabinets with contents.`);
            return;
        }
        try {
            await Promise.all(selectedIds.map(id => deleteShelf(id)));
            toast.success(`${selectedIds.length} cabinets deleted`);
            setSelectedIds([]);
            setIsBulkDeleteDialogOpen(false);
        } catch { toast.error('Failed to delete some cabinets'); }
    };

    const getParentShelfName = (cabinetId: string): string => {
        const parent = cabinets.find(s => s.id === cabinetId);
        return parent ? `${parent.name} (${parent.code})` : 'Unknown';
    };

    const getCabinetStats = (cabinetId: string) => {
        const myFolders = folders.filter(f => f.shelfId === cabinetId);
        const myFiles = procurements.filter(p => myFolders.map(f => f.id).includes(p.folderId));
        return { folders: myFolders.length, files: myFiles.length };
    };

    const filteredCabinets = useMemo(() => shelves
        .filter(cabinet => {
            if (filterShelfId && filterShelfId !== 'all' && cabinet.cabinetId !== filterShelfId) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return cabinet.name.toLowerCase().includes(q) ||
                    cabinet.code.toLowerCase().includes(q) ||
                    (cabinet.description && cabinet.description.toLowerCase().includes(q));
            }
            return true;
        })
        .sort((a, b) => {
            let cmp = 0;
            if (sortField === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortField === 'code') {
                const n = (s: string) => { const m = s.match(/\d+/); return m ? parseInt(m[0]) : 0; };
                cmp = n(a.code) - n(b.code) || a.code.localeCompare(b.code);
            } else if (sortField === 'contents') {
                cmp = getCabinetStats(a.id).folders - getCabinetStats(b.id).folders;
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        }), [shelves, filterShelfId, searchQuery, sortField, sortDirection, folders, procurements]);

    // Reset page on filter change
    React.useEffect(() => { setCurrentPage(1); }, [searchQuery, filterShelfId, sortField, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(filteredCabinets.length / ITEMS_PER_PAGE));
    const paginatedCabinets = filteredCabinets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(prev => Array.from(new Set([...prev, ...paginatedCabinets.map(c => c.id)])));
        else setSelectedIds(prev => prev.filter(id => !paginatedCabinets.map(c => c.id).includes(id)));
    };
    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) setSelectedIds(prev => [...prev, id]);
        else setSelectedIds(prev => prev.filter(s => s !== id));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Cabinets</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Manage cabinets within drawers (Tier 2)</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedIds.length})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {selectedIds.length} Cabinets?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete the selected cabinets.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">Delete All</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Add Cabinet
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Cabinet</DialogTitle>
                                <DialogDescription>Create a new cabinet inside a drawer.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Parent Drawer</Label>
                                    <select value={parentShelfId} onChange={e => setParentShelfId(e.target.value)}
                                        className="col-span-3 bg-background border border-border text-foreground rounded-md p-2 text-sm">
                                        <option value="">Select Drawer</option>
                                        {cabinets.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Name</Label>
                                    <Input value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Code</Label>
                                    <Input value={code} onChange={e => setCode(e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Description</Label>
                                    <Textarea value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">Save Cabinet</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4 items-center flex-wrap">
                        <Input placeholder="Search cabinets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-[250px]" />
                        <Label className="text-muted-foreground whitespace-nowrap">Filter:</Label>
                        <Select value={filterShelfId} onValueChange={setFilterShelfId}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Drawers" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Drawers</SelectItem>
                                {cabinets.map(s => <SelectItem key={s.id} value={s.id}>{s.code} - {s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Label className="text-muted-foreground whitespace-nowrap">Sort:</Label>
                        <Select value={sortField} onValueChange={v => setSortField(v as any)}>
                            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="code">Code</SelectItem>
                                <SelectItem value="contents">Contents</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => setSortDirection(p => p === 'asc' ? 'desc' : 'asc')}>
                            {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
                        </Button>
                        <span className="ml-auto text-xs text-muted-foreground">{filteredCabinets.length} cabinet{filteredCabinets.length !== 1 ? 's' : ''}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={paginatedCabinets.length > 0 && paginatedCabinets.every(c => selectedIds.includes(c.id))}
                                        onCheckedChange={c => handleSelectAll(c as boolean)}
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Parent Drawer</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Contents</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCabinets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No cabinets found. Add your first cabinet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedCabinets.map(cabinet => (
                                    <TableRow key={cabinet.id} className="table-row-hover">
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(cabinet.id)}
                                                onCheckedChange={c => handleSelectOne(cabinet.id, c as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                    <Package className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{cabinet.name}</p>
                                                    <p className="text-xs text-muted-foreground">{cabinet.description || 'No description'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{getParentShelfName(cabinet.cabinetId)}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                                                {cabinet.code}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {getCabinetStats(cabinet.id).folders} folder{getCabinetStats(cabinet.id).folders !== 1 ? 's' : ''}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm"
                                                    className="h-8 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                                    onClick={() => { window.location.href = `/storage?tab=folders&cabinetId=${cabinet.id}`; }}>
                                                    <Eye className="h-4 w-4 mr-1" /> View Folders
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(cabinet)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Cabinet?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {(() => {
                                                                    const stats = getCabinetStats(cabinet.id);
                                                                    if (stats.folders > 0 || stats.files > 0)
                                                                        return <span className="text-destructive">Cannot delete — contains {stats.folders} folder(s) and {stats.files} file(s). Empty it first.</span>;
                                                                    return <span>This will permanently delete <strong>{cabinet.name}</strong>.</span>;
                                                                })()}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(cabinet.id)}
                                                                disabled={(() => { const s = getCabinetStats(cabinet.id); return s.folders > 0 || s.files > 0; })()}
                                                                className="bg-destructive hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredCabinets.length)} of {filteredCabinets.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce<(number | '...')[]>((acc, p, i, arr) => {
                                if (i > 0 && (arr[i - 1] as number) !== p - 1) acc.push('...');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) => p === '...' ? (
                                <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
                            ) : (
                                <Button key={p} variant={currentPage === p ? 'default' : 'outline'} size="sm"
                                    className="h-8 w-8 p-0" onClick={() => setCurrentPage(p as number)}>
                                    {p}
                                </Button>
                            ))}
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Cabinet</DialogTitle>
                        <DialogDescription>Update cabinet details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Parent Drawer</Label>
                            <select value={parentShelfId} onChange={e => setParentShelfId(e.target.value)}
                                className="col-span-3 bg-background border border-border text-foreground rounded-md p-2 text-sm">
                                <option value="">Select Drawer</option>
                                {cabinets.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Code</Label>
                            <Input value={code} onChange={e => setCode(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Description</Label>
                            <Textarea value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Cabinets;
