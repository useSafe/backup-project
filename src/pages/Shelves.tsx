import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { addCabinet, updateCabinet, deleteCabinet } from '@/lib/storage';
import { Cabinet } from '@/types/procurement';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const ITEMS_PER_PAGE = 10;

const Shelves: React.FC = () => {
    const navigate = useNavigate();
    const { shelves, cabinets, folders, procurements } = useData();

    // UI State
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentShelf, setCurrentShelf] = useState<Cabinet | null>(null);

    // Filter & Sort
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
    const [description, setDescription] = useState('');

    const resetForm = () => {
        setName('');
        setCode('');
        setDescription('');
        setCurrentShelf(null);
    };

    const handleAdd = async () => {
        if (!name || !code) { toast.error('Name and Code are required'); return; }
        try {
            await addCabinet(name, code, description);
            setIsAddDialogOpen(false);
            resetForm();
            toast.success('Drawer added successfully');
        } catch { toast.error('Failed to add drawer'); }
    };

    const handleEditClick = (shelf: Cabinet) => {
        setCurrentShelf(shelf);
        setName(shelf.name);
        setCode(shelf.code);
        setDescription(shelf.description || '');
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!currentShelf || !name || !code) return;
        try {
            await updateCabinet(currentShelf.id, { name, code, description });
            setIsEditDialogOpen(false);
            resetForm();
            toast.success('Drawer updated successfully');
        } catch { toast.error('Failed to update drawer'); }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCabinet(id);
            toast.success('Drawer deleted successfully');
            setSelectedIds(prev => prev.filter(s => s !== id));
        } catch { toast.error('Failed to delete drawer'); }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const withContents = selectedIds.filter(id => {
            const s = getShelfStats(id);
            return s.cabinets > 0 || s.folders > 0 || s.files > 0;
        });
        if (withContents.length > 0) {
            toast.error(`Cannot delete ${withContents.length} drawers with contents.`);
            return;
        }
        try {
            await Promise.all(selectedIds.map(id => deleteCabinet(id)));
            toast.success(`${selectedIds.length} drawers deleted`);
            setSelectedIds([]);
            setIsBulkDeleteDialogOpen(false);
        } catch { toast.error('Failed to delete some drawers'); }
    };

    const getShelfStats = (shelfId: string) => {
        const myCabinets = shelves.filter(s => s.cabinetId === shelfId);
        const myCabinetIds = myCabinets.map(c => c.id);
        const myFolders = folders.filter(f => myCabinetIds.includes(f.shelfId));
        const myFolderIds = myFolders.map(f => f.id);
        const myFiles = procurements.filter(p => myFolderIds.includes(p.folderId));
        return { cabinets: myCabinets.length, folders: myFolders.length, files: myFiles.length };
    };

    const filteredShelves = useMemo(() => cabinets
        .filter(shelf => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return shelf.name.toLowerCase().includes(q) ||
                shelf.code.toLowerCase().includes(q) ||
                (shelf.description && shelf.description.toLowerCase().includes(q));
        })
        .sort((a, b) => {
            let cmp = 0;
            if (sortField === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortField === 'code') {
                const n = (s: string) => { const m = s.match(/\d+/); return m ? parseInt(m[0]) : 0; };
                cmp = n(a.code) - n(b.code) || a.code.localeCompare(b.code);
            } else if (sortField === 'contents') {
                cmp = getShelfStats(a.id).cabinets - getShelfStats(b.id).cabinets;
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        }), [cabinets, searchQuery, sortField, sortDirection, shelves, folders, procurements]);

    // Reset page on filter change
    React.useEffect(() => { setCurrentPage(1); }, [searchQuery, sortField, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(filteredShelves.length / ITEMS_PER_PAGE));
    const paginatedShelves = filteredShelves.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(prev => Array.from(new Set([...prev, ...paginatedShelves.map(c => c.id)])));
        else setSelectedIds(prev => prev.filter(id => !paginatedShelves.map(c => c.id).includes(id)));
    };
    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) setSelectedIds(prev => [...prev, id]);
        else setSelectedIds(prev => prev.filter(s => s !== id));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Drawers</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Manage physical storage drawers (Tier 1)</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected ({selectedIds.length})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {selectedIds.length} Drawers?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the selected drawers and ALL content inside them.
                                    </AlertDialogDescription>
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
                                <Plus className="mr-2 h-4 w-4" /> Add Drawer
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Drawer</DialogTitle>
                                <DialogDescription>Create a new top-level storage drawer.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Name</Label>
                                    <Input value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="Drawer 1" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Code</Label>
                                    <Input value={code} onChange={e => setCode(e.target.value)} className="col-span-3" placeholder="D1" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Description</Label>
                                    <Textarea value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" placeholder="Main storage drawer..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">Save Drawer</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4 items-center flex-wrap">
                        <Input
                            placeholder="Search drawers..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-[250px]"
                        />
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
                        <span className="ml-auto text-xs text-muted-foreground">{filteredShelves.length} drawer{filteredShelves.length !== 1 ? 's' : ''}</span>
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
                                        checked={paginatedShelves.length > 0 && paginatedShelves.every(c => selectedIds.includes(c.id))}
                                        onCheckedChange={c => handleSelectAll(c as boolean)}
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Contents</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedShelves.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No drawers found. Add your first drawer.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedShelves.map(shelf => (
                                    <TableRow key={shelf.id} className="table-row-hover">
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(shelf.id)}
                                                onCheckedChange={c => handleSelectOne(shelf.id, c as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                                    <Layers className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{shelf.name}</p>
                                                    <p className="text-xs text-muted-foreground">{shelf.description || 'No description'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                                                {shelf.code}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {getShelfStats(shelf.id).cabinets} cabinet{getShelfStats(shelf.id).cabinets !== 1 ? 's' : ''}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => navigate(`/storage?tab=cabinets&shelfId=${shelf.id}`)}
                                                    className="h-8 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20">
                                                    <Eye className="h-4 w-4 mr-1" /> View Cabinets
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(shelf)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
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
                                                            <AlertDialogTitle>Delete Drawer?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {(() => {
                                                                    const stats = getShelfStats(shelf.id);
                                                                    const hasContents = stats.cabinets > 0 || stats.folders > 0 || stats.files > 0;
                                                                    if (hasContents) return (
                                                                        <span className="text-destructive">
                                                                            Cannot delete — contains {stats.cabinets} cabinet(s), {stats.folders} folder(s), {stats.files} file(s). Empty it first.
                                                                        </span>
                                                                    );
                                                                    return <span>This will permanently delete <strong>{shelf.name}</strong>.</span>;
                                                                })()}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(shelf.id)}
                                                                disabled={(() => { const s = getShelfStats(shelf.id); return s.cabinets > 0 || s.folders > 0 || s.files > 0; })()}
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
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredShelves.length)} of {filteredShelves.length}
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
                        <DialogTitle>Edit Drawer</DialogTitle>
                        <DialogDescription>Update drawer details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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

export default Shelves;
