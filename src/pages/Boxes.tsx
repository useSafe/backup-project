import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@/types/procurement';
import { addBox, updateBox, deleteBox } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Search, Pencil, Trash2, Package, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useData } from '@/contexts/DataContext';

const ITEMS_PER_PAGE = 10;

const Boxes: React.FC = () => {
    const navigate = useNavigate();
    const { boxes, procurements, folders } = useData();

    // UI State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Sorting
    const [sortField, setSortField] = useState<'name' | 'code' | 'contents' | 'date'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Bulk Actions
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ name: '', code: '', description: '' });
    const [selectedBox, setSelectedBox] = useState<Box | null>(null);

    const getBoxStats = (boxId: string) => {
        const myFiles = procurements.filter(p => p.boxId === boxId);
        const myFolders = folders.filter(f => f.boxId === boxId);
        return { files: myFiles.length, folders: myFolders.length };
    };

    const filteredBoxes = useMemo(() => boxes
        .filter(b =>
            b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            let cmp = 0;
            if (sortField === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortField === 'code') {
                const n = (s: string) => { const m = s.match(/\d+/); return m ? parseInt(m[0]) : 0; };
                cmp = n(a.code) - n(b.code) || a.code.localeCompare(b.code);
            } else if (sortField === 'contents') {
                cmp = getBoxStats(a.id).folders - getBoxStats(b.id).folders;
            } else if (sortField === 'date') {
                cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        }), [boxes, searchQuery, sortField, sortDirection, procurements, folders]);

    // Reset page on filter change
    React.useEffect(() => { setCurrentPage(1); }, [searchQuery, sortField, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(filteredBoxes.length / ITEMS_PER_PAGE));
    const paginatedBoxes = filteredBoxes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const resetForm = () => { setFormData({ name: '', code: '', description: '' }); setSelectedBox(null); };

    const handleAdd = async () => {
        if (!formData.name || !formData.code) { toast.error('Name and Code are required'); return; }
        try {
            await addBox({ name: formData.name, code: formData.code, description: formData.description });
            toast.success('Box added successfully');
            setIsAddOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(`Failed to add box: ${error.message || 'Unknown error'}`);
        }
    };

    const handleEdit = async () => {
        if (!selectedBox || !formData.name || !formData.code) return;
        try {
            await updateBox(selectedBox.id, { name: formData.name, code: formData.code.toUpperCase(), description: formData.description });
            toast.success('Box updated successfully');
            setIsEditOpen(false);
            resetForm();
        } catch { toast.error('Failed to update box'); }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBox(id);
            toast.success('Box deleted');
            setSelectedIds(prev => prev.filter(s => s !== id));
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete box');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        try {
            await Promise.all(selectedIds.map(id => deleteBox(id)));
            toast.success(`${selectedIds.length} boxes deleted`);
            setSelectedIds([]);
            setIsBulkDeleteDialogOpen(false);
        } catch { toast.error('Failed to delete some boxes'); }
    };

    const openEdit = (box: Box) => {
        setSelectedBox(box);
        setFormData({ name: box.name, code: box.code, description: box.description || '' });
        setIsEditOpen(true);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(prev => Array.from(new Set([...prev, ...paginatedBoxes.map(b => b.id)])));
        else setSelectedIds(prev => prev.filter(id => !paginatedBoxes.map(b => b.id).includes(id)));
    };
    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) setSelectedIds(prev => [...prev, id]);
        else setSelectedIds(prev => prev.filter(s => s !== id));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Boxes</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Manage storage boxes</p>
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
                                    <AlertDialogTitle>Delete {selectedIds.length} Boxes?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete the selected boxes.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">Delete All</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Dialog open={isAddOpen || isEditOpen} onOpenChange={open => { if (!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Add Box
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{isEditOpen ? 'Edit Box' : 'Add New Box'}</DialogTitle>
                                <DialogDescription>{isEditOpen ? 'Update box details.' : 'Create a new storage box.'}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Name</Label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Year 2024 Box" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Code</Label>
                                    <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="BOX-01" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Description</Label>
                                    <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
                                <Button onClick={isEditOpen ? handleEdit : handleAdd} className="bg-blue-600 hover:bg-blue-700">
                                    {isEditOpen ? 'Save Changes' : 'Create Box'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4 items-center flex-wrap">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search boxes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-[250px] pl-9" />
                        </div>
                        <Label className="text-muted-foreground whitespace-nowrap">Sort:</Label>
                        <Select value={sortField} onValueChange={v => setSortField(v as any)}>
                            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="code">Code</SelectItem>
                                <SelectItem value="contents">Contents</SelectItem>
                                <SelectItem value="date">Date Created</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => setSortDirection(p => p === 'asc' ? 'desc' : 'asc')}>
                            {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
                        </Button>
                        <span className="ml-auto text-xs text-muted-foreground">{filteredBoxes.length} box{filteredBoxes.length !== 1 ? 'es' : ''}</span>
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
                                        checked={paginatedBoxes.length > 0 && paginatedBoxes.every(b => selectedIds.includes(b.id))}
                                        onCheckedChange={c => handleSelectAll(c as boolean)}
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Contents</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedBoxes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No boxes found. Create a new box to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedBoxes.map(box => (
                                    <TableRow key={box.id} className="table-row-hover">
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(box.id)}
                                                onCheckedChange={c => handleSelectOne(box.id, c as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-orange-500" />
                                                {box.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-foreground text-xs px-2 py-0.5 rounded bg-muted border border-border">{box.code}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{box.description || '—'}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {format(new Date(box.createdAt), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                {getBoxStats(box.id).folders} folders
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => navigate(`/storage?tab=folders&boxId=${box.id}`)}
                                                    className="h-8 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20">
                                                    <FolderOpen className="h-4 w-4 mr-1" /> View Folders
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(box)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
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
                                                            <AlertDialogTitle>Delete Box?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {getBoxStats(box.id).folders > 0
                                                                    ? <span className="text-destructive">Cannot delete — contains {getBoxStats(box.id).folders} folders. Empty it first.</span>
                                                                    : <span>This will permanently delete <strong>{box.name}</strong>.</span>
                                                                }
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(box.id)}
                                                                disabled={getBoxStats(box.id).folders > 0}
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
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredBoxes.length)} of {filteredBoxes.length}
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
        </div>
    );
};

export default Boxes;
