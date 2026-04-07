import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { addFolder, updateFolder, deleteFolder } from '@/lib/storage';
import { Cabinet, Shelf, Folder } from '@/types/procurement';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import {
    Plus, Pencil, Trash2, Eye, FolderOpen, ArrowUp,
    Box as BoxIcon, Search, X, ArrowUpDown, SlidersHorizontal, Filter,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// ─── Reusable filter chip ─────────────────────────────────────────────────────
const FilterChip: React.FC<{
    label: string;
    color?: 'blue' | 'amber' | 'purple';
    onRemove: () => void;
}> = ({ label, color = 'blue', onRemove }) => {
    const colors = {
        blue:   'bg-blue-500/15 border-blue-500/30 text-blue-400',
        amber:  'bg-amber-500/15 border-amber-500/30 text-amber-400',
        purple: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    };
    return (
        <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0',
            colors[color]
        )}>
            <span className="max-w-[120px] truncate">{label}</span>
            <button onClick={onRemove} className="ml-0.5 opacity-70 hover:opacity-100 transition-opacity" aria-label="Remove">
                <X className="h-3 w-3" />
            </button>
        </span>
    );
};

// ─── Shared color picker ──────────────────────────────────────────────────────
const DEFAULT_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8E6CF',
];

const ColorPicker: React.FC<{ color: string; onChange: (c: string) => void; idPrefix: string }> = ({ color, onChange, idPrefix }) => (
    <div className="col-span-3 space-y-3">
        <div className="flex gap-2 flex-wrap">
            {DEFAULT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => onChange(c)}
                    className={cn('w-8 h-8 rounded-full border-2 transition-all', color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105')}
                    style={{ backgroundColor: c }} title={c} />
            ))}
        </div>
        <div className="flex items-center gap-2">
            <Label htmlFor={`${idPrefix}-color`} className="text-slate-400 text-sm whitespace-nowrap">Custom:</Label>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <input id={`${idPrefix}-color`} type="color" value={color} onChange={e => onChange(e.target.value)}
                    className="h-9 w-14 rounded border-2 border-slate-700 bg-[#1e293b] cursor-pointer flex-shrink-0" />
                <Input type="text" value={color} onChange={e => onChange(e.target.value)} placeholder="#FF6B6B"
                    className="flex-1 bg-[#1e293b] border-slate-700 text-white font-mono text-sm min-w-0" />
            </div>
        </div>
    </div>
);

// ─── Shared parent selector (Add & Edit) ──────────────────────────────────────
const ParentSelector: React.FC<{
    parentType: 'shelf' | 'box';
    onParentTypeChange: (t: 'shelf' | 'box') => void;
    selectedTier1Id: string; onTier1Change: (v: string) => void;
    selectedTier2Id: string; onTier2Change: (v: string) => void;
    selectedBoxId: string;   onBoxChange:  (v: string) => void;
    cabinets: Cabinet[]; shelves: Shelf[]; boxes: any[];
}> = ({ parentType, onParentTypeChange, selectedTier1Id, onTier1Change, selectedTier2Id, onTier2Change, selectedBoxId, onBoxChange, cabinets, shelves, boxes }) => (
    <>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-slate-300 text-sm">Location</Label>
            <div className="col-span-3 flex gap-2">
                <button type="button" onClick={() => onParentTypeChange('shelf')}
                    className={cn('px-3 py-1.5 rounded text-sm font-medium transition-all', parentType === 'shelf' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white')}>
                    Drawer → Cabinet
                </button>
                <button type="button" onClick={() => onParentTypeChange('box')}
                    className={cn('px-3 py-1.5 rounded text-sm font-medium transition-all', parentType === 'box' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white')}>
                    Inside Box
                </button>
            </div>
        </div>
        {parentType === 'shelf' ? (
            <>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-slate-300 text-sm">Drawer</Label>
                    <select value={selectedTier1Id} onChange={e => onTier1Change(e.target.value)}
                        className="col-span-3 bg-[#1e293b] border border-slate-700 text-white rounded-md p-2 text-sm">
                        <option value="">Select Drawer</option>
                        {cabinets.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-slate-300 text-sm">Cabinet</Label>
                    <select value={selectedTier2Id} onChange={e => onTier2Change(e.target.value)}
                        className="col-span-3 bg-[#1e293b] border border-slate-700 text-white rounded-md p-2 text-sm disabled:opacity-40"
                        disabled={!selectedTier1Id}>
                        <option value="">Select Cabinet</option>
                        {shelves.filter(s => s.cabinetId === selectedTier1Id).map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                </div>
            </>
        ) : (
            <div className="grid grid-cols-4 items-center gap-4 animate-in fade-in">
                <Label className="text-right text-slate-300 text-sm">Box</Label>
                <select value={selectedBoxId} onChange={e => onBoxChange(e.target.value)}
                    className="col-span-3 bg-[#1e293b] border border-slate-700 text-white rounded-md p-2 text-sm">
                    <option value="">Select Box</option>
                    {boxes.map((b: any) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
                </select>
            </div>
        )}
    </>
);

// ═══════════════════════════════════════════════════════════════════════════════
const Folders: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cabinetIdFromUrl = searchParams.get('cabinetId');
    const boxIdFromUrl     = searchParams.get('boxId');

    const { shelves, cabinets, folders, boxes, procurements } = useData();

    // ── Dialog state ────────────────────────────────────────────────────────
    const [isAddDialogOpen,      setIsAddDialogOpen]      = useState(false);
    const [isEditDialogOpen,     setIsEditDialogOpen]     = useState(false);
    const [isRelocateDialogOpen, setIsRelocateDialogOpen] = useState(false);
    const [currentFolder,        setCurrentFolder]        = useState<Folder | null>(null);
    const [relocateFolder,       setRelocateFolder]       = useState<Folder | null>(null);
    const [newStackNumber,       setNewStackNumber]       = useState<number>(0);

    // ── Filter state ─────────────────────────────────────────────────────────
    const [filterTier1Id,   setFilterTier1Id]   = useState<string>('');
    const [filterCabinetId, setFilterCabinetId] = useState<string>(cabinetIdFromUrl || '');
    const [filterBoxId,     setFilterBoxId]     = useState<string>(boxIdFromUrl     || '');
    const [searchQuery,     setSearchQuery]     = useState('');
    const [sortField,       setSortField]       = useState<'name' | 'code' | 'contents' | 'stackNumber'>('name');
    const [sortDirection,   setSortDirection]   = useState<'asc' | 'desc'>('asc');

    // ── Bulk selection ───────────────────────────────────────────────────────
    const [selectedIds,            setSelectedIds]            = useState<string[]>([]);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

    // ── Form state ───────────────────────────────────────────────────────────
    const [name,            setName]            = useState('');
    const [code,            setCode]            = useState('');
    const [selectedTier1Id, setSelectedTier1Id] = useState('');
    const [selectedTier2Id, setSelectedTier2Id] = useState('');
    const [selectedBoxId,   setSelectedBoxId]   = useState('');
    const [parentType,      setParentType]      = useState<'shelf' | 'box'>('shelf');
    const [description,     setDescription]     = useState('');
    const [color,           setColor]           = useState('#FF6B6B');

    // ── Sync URL params ──────────────────────────────────────────────────────
    useEffect(() => {
        if (cabinetIdFromUrl) { setFilterCabinetId(cabinetIdFromUrl); setFilterBoxId(''); setFilterTier1Id(''); }
        if (boxIdFromUrl)     { setFilterBoxId(boxIdFromUrl); setFilterCabinetId(''); setFilterTier1Id(''); }
    }, [cabinetIdFromUrl, boxIdFromUrl]);

    // ── Filter handlers ──────────────────────────────────────────────────────
    const handleFilterBoxChange     = (v: string) => { setFilterBoxId(v);     if (v && v !== 'all') { setFilterTier1Id(''); setFilterCabinetId(''); } };
    const handleFilterTier1Change   = (v: string) => { setFilterTier1Id(v);   setFilterCabinetId(''); if (v && v !== 'all') setFilterBoxId(''); };
    const handleFilterCabinetChange = (v: string) => { setFilterCabinetId(v); if (v && v !== 'all') setFilterBoxId(''); };
    const clearAllFilters           = ()           => { setFilterTier1Id(''); setFilterCabinetId(''); setFilterBoxId(''); setSearchQuery(''); };

    const hasActiveFilters = !!(
        (filterTier1Id   && filterTier1Id   !== 'all') ||
        (filterCabinetId && filterCabinetId !== 'all') ||
        (filterBoxId     && filterBoxId     !== 'all') ||
        searchQuery
    );

    // ── Form helpers ─────────────────────────────────────────────────────────
    const resetForm = () => {
        setName(''); setCode(''); setSelectedTier1Id(''); setSelectedTier2Id('');
        setSelectedBoxId(''); setParentType('shelf'); setDescription(''); setColor('#FF6B6B');
        setCurrentFolder(null);
    };
    const handleParentTypeChange = (t: 'shelf' | 'box') => {
        setParentType(t); setSelectedTier1Id(''); setSelectedTier2Id(''); setSelectedBoxId('');
    };

    // ── CRUD ─────────────────────────────────────────────────────────────────
    const handleAdd = async () => {
        if (!name.trim() || !code.trim()) { toast.error('Name and Code are required'); return; }
        const parentId = parentType === 'shelf' ? selectedTier2Id : selectedBoxId;
        if (!parentId) { toast.error(`Select a parent ${parentType === 'shelf' ? 'Cabinet' : 'Box'}`); return; }
        try {
            await addFolder(parentId, name.trim(), code.trim(), description, color, parentType);
            setIsAddDialogOpen(false); resetForm(); toast.success('Folder added');
        } catch (e: any) { toast.error(`Failed: ${e.message || 'Unknown error'}`); }
    };

    const handleEditClick = (folder: Folder) => {
        setCurrentFolder(folder); setName(folder.name); setCode(folder.code);
        if (folder.boxId) {
            setParentType('box'); setSelectedBoxId(folder.boxId);
            const b = boxes.find((b: any) => b.id === folder.boxId);
            if (b) { if (b.shelfId) setSelectedTier2Id(b.shelfId); if (b.cabinetId) setSelectedTier1Id(b.cabinetId); }
        } else if (folder.shelfId) {
            setParentType('shelf'); setSelectedTier2Id(folder.shelfId);
            const s = shelves.find(s => s.id === folder.shelfId);
            if (s) setSelectedTier1Id(s.cabinetId);
        }
        setDescription(folder.description || ''); setColor(folder.color || '#FF6B6B');
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!currentFolder || !name.trim() || !code.trim()) return;
        const parentId = parentType === 'shelf' ? selectedTier2Id : selectedBoxId;
        if (!parentId) return;
        try {
            const isOldShelf = !!currentFolder.shelfId, isNewShelf = parentType === 'shelf';
            const oldParentId = currentFolder.shelfId || currentFolder.boxId;
            const hasParentChanged = (isOldShelf !== isNewShelf) || (oldParentId !== parentId);
            const updates: any = {
                name: name.trim(), code: code.trim(), description, color,
                shelfId: parentType === 'shelf' ? parentId : null,
                boxId:   parentType === 'box'   ? parentId : null,
            };
            if (hasParentChanged) {
                const siblings = folders.filter(f => isNewShelf ? f.shelfId === parentId : f.boxId === parentId);
                updates.stackNumber = Math.max(...siblings.map(f => f.stackNumber || 0), 0) + 1;
            }
            await updateFolder(currentFolder.id, updates);
            setIsEditDialogOpen(false); resetForm(); toast.success('Folder updated');
        } catch { toast.error('Failed to update folder'); }
    };

    const handleDelete = async (id: string) => {
        try { await deleteFolder(id); toast.success('Folder deleted'); setSelectedIds(p => p.filter(s => s !== id)); }
        catch { toast.error('Failed to delete folder'); }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        const withContents = selectedIds.filter(id => getFolderStats(id).files > 0);
        if (withContents.length) { toast.error(`${withContents.length} folders still have files.`); return; }
        try {
            await Promise.all(selectedIds.map(id => deleteFolder(id)));
            toast.success(`${selectedIds.length} folders deleted`);
            setSelectedIds([]); setIsBulkDeleteDialogOpen(false);
        } catch { toast.error('Failed to delete some folders'); }
    };

    const handleSelectAll = (checked: boolean) => {
        const ids = filteredFolders.map(f => f.id);
        setSelectedIds(p => checked ? Array.from(new Set([...p, ...ids])) : p.filter(id => !ids.includes(id)));
    };
    const handleSelectOne = (id: string, checked: boolean) =>
        setSelectedIds(p => checked ? [...p, id] : p.filter(s => s !== id));

    const handleRelocateClick = (folder: Folder) => {
        setRelocateFolder(folder); setNewStackNumber(folder.stackNumber || 0); setIsRelocateDialogOpen(true);
    };
    const handleRelocateConfirm = async () => {
        if (!relocateFolder) return;
        try {
            await updateFolder(relocateFolder.id, { stackNumber: newStackNumber });
            setIsRelocateDialogOpen(false); setRelocateFolder(null);
            toast.success(`Stack number updated to ${newStackNumber}`);
        } catch { toast.error('Failed to update stack number'); }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getParentCabinetName = (shelfId?: string | null) => {
        if (!shelfId) return 'Unknown';
        const c = shelves.find(s => s.id === shelfId);
        return c ? `${c.name} (${c.code})` : 'Unknown';
    };
    const getParentDrawerName = (shelfId?: string | null) => {
        if (!shelfId) return 'Unknown';
        const shelf = shelves.find(s => s.id === shelfId);
        if (!shelf) return 'Unknown';
        const drawer = cabinets.find(c => c.id === shelf.cabinetId);
        return drawer ? `${drawer.name} (${drawer.code})` : 'Unknown';
    };
    const getFolderStats = (folderId: string) => ({
        files: procurements.filter(p => p.folderId === folderId).length
    });

    // ── Active filter labels ──────────────────────────────────────────────────
    const activeDrawer  = (filterTier1Id   && filterTier1Id   !== 'all') ? cabinets.find(c => c.id === filterTier1Id)  : null;
    const activeCabinet = (filterCabinetId && filterCabinetId !== 'all') ? shelves.find(s => s.id === filterCabinetId) : null;
    const activeBox     = (filterBoxId     && filterBoxId     !== 'all') ? boxes.find((b: any) => b.id === filterBoxId): null;

    // ── Filtered + sorted list ────────────────────────────────────────────────
    const filteredFolders = useMemo(() => {
        return folders
            .filter(folder => {
                if (filterBoxId && filterBoxId !== 'all') return folder.boxId === filterBoxId;
                if (filterCabinetId && filterCabinetId !== 'all' && folder.shelfId !== filterCabinetId) return false;
                if (filterTier1Id && filterTier1Id !== 'all') {
                    const pc = shelves.find(s => s.id === folder.shelfId);
                    if (!pc || pc.cabinetId !== filterTier1Id) return false;
                }
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return folder.name.toLowerCase().includes(q) ||
                        folder.code.toLowerCase().includes(q) ||
                        (folder.description?.toLowerCase().includes(q) ?? false);
                }
                return true;
            })
            .sort((a, b) => {
                let cmp = 0;
                if      (sortField === 'name')        cmp = a.name.localeCompare(b.name);
                else if (sortField === 'code') {
                    const n = (s: string) => { const m = s.match(/\d+/); return m ? parseInt(m[0]) : 0; };
                    const [an, bn] = [n(a.code), n(b.code)];
                    cmp = an === bn ? a.code.localeCompare(b.code) : an - bn;
                }
                else if (sortField === 'contents')    cmp = getFolderStats(a.id).files - getFolderStats(b.id).files;
                else if (sortField === 'stackNumber') cmp = (a.stackNumber || 0) - (b.stackNumber || 0);
                return sortDirection === 'asc' ? cmp : -cmp;
            });
    }, [folders, filterBoxId, filterCabinetId, filterTier1Id, searchQuery, sortField, sortDirection, shelves, procurements]);

    const allCurrentSelected = filteredFolders.length > 0 && filteredFolders.every(f => selectedIds.includes(f.id));

    return (
        <div className="space-y-5 animate-in fade-in duration-500">

            {/* ── Page Header ────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-white">Folders</h1>
                    <p className="text-slate-400 mt-0.5 text-sm">Manage folders within cabinets and boxes</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    {selectedIds.length > 0 && (
                        <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedIds.length})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#1e293b] border-slate-800 text-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {selectedIds.length} Folders?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                        Only empty folders will be deleted. This cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete All</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    <Dialog open={isAddDialogOpen} onOpenChange={o => { setIsAddDialogOpen(o); if (!o) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Add Folder
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0f172a] border-slate-800 text-white max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Folder</DialogTitle>
                                <DialogDescription className="text-slate-400">Create a folder inside a cabinet or box.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <ParentSelector
                                    parentType={parentType} onParentTypeChange={handleParentTypeChange}
                                    selectedTier1Id={selectedTier1Id} onTier1Change={v => { setSelectedTier1Id(v); setSelectedTier2Id(''); setSelectedBoxId(''); }}
                                    selectedTier2Id={selectedTier2Id} onTier2Change={v => { setSelectedTier2Id(v); setSelectedBoxId(''); }}
                                    selectedBoxId={selectedBoxId} onBoxChange={setSelectedBoxId}
                                    cabinets={cabinets} shelves={shelves} boxes={boxes}
                                />
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="add-name" className="text-right text-slate-300 text-sm">Name</Label>
                                    <Input id="add-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Procurement 2024" className="col-span-3 bg-[#1e293b] border-slate-700 text-white" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="add-code" className="text-right text-slate-300 text-sm">Code</Label>
                                    <Input id="add-code" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. F1" className="col-span-3 bg-[#1e293b] border-slate-700 text-white" />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label className="text-right text-slate-300 text-sm mt-2">Color</Label>
                                    <ColorPicker color={color} onChange={setColor} idPrefix="add" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="add-desc" className="text-right text-slate-300 text-sm">Description</Label>
                                    <Textarea id="add-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="col-span-3 bg-[#1e293b] border-slate-700 text-white" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-slate-700 text-white hover:bg-slate-800">Cancel</Button>
                                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">Save Folder</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* ── Filter Card ─────────────────────────────────────────────────── */}
            <Card className="border-none bg-[#0f172a] shadow-lg">
                <CardContent className="p-4 space-y-3">

                    {/* Row 1 — Search + Sort (never wraps badly) */}
                    <div className="flex gap-2 items-center">
                        <div className="relative flex-1 max-w-sm min-w-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                            <Input
                                placeholder="Search name, code, description…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-8 bg-[#1e293b] border-slate-700 text-white h-9 w-full"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                            <Select value={sortField} onValueChange={v => setSortField(v as any)}>
                                <SelectTrigger className="w-[120px] bg-[#1e293b] border-slate-700 text-white h-9 text-xs gap-1">
                                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="code">Code</SelectItem>
                                    <SelectItem value="contents">Files</SelectItem>
                                    <SelectItem value="stackNumber">Stack #</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm"
                                onClick={() => setSortDirection(p => p === 'asc' ? 'desc' : 'asc')}
                                className="bg-[#1e293b] border-slate-700 text-white hover:bg-slate-700 h-9 w-9 p-0 flex-shrink-0"
                                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}>
                                {sortDirection === 'asc' ? '↑' : '↓'}
                            </Button>
                        </div>
                    </div>

                    {/* Row 2 — Dropdown filters (fixed-width, never overflow) */}
                    <div className="flex gap-2 items-center flex-wrap">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                        <span className="text-xs text-slate-500 whitespace-nowrap">Filter:</span>

                        {/* Drawer */}
                        <Select value={filterTier1Id || 'all'} onValueChange={handleFilterTier1Change}>
                            <SelectTrigger className={cn(
                                'h-8 text-xs border-slate-700 text-white w-[160px]',
                                activeDrawer ? 'bg-blue-500/10 border-blue-500/40' : 'bg-[#1e293b]'
                            )}>
                                <span className="truncate">
                                    {activeDrawer ? `${activeDrawer.code} – ${activeDrawer.name}` : 'All Drawers'}
                                </span>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                                <SelectItem value="all">All Drawers</SelectItem>
                                {cabinets.map(c => <SelectItem key={c.id} value={c.id}>{c.code} – {c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        {/* Cabinet */}
                        <Select value={filterCabinetId || 'all'} onValueChange={handleFilterCabinetChange}>
                            <SelectTrigger className={cn(
                                'h-8 text-xs border-slate-700 text-white w-[160px]',
                                activeCabinet ? 'bg-purple-500/10 border-purple-500/40' : 'bg-[#1e293b]',
                                activeBox ? 'opacity-40 pointer-events-none' : ''
                            )}>
                                <span className="truncate">
                                    {activeCabinet ? `${activeCabinet.code} – ${activeCabinet.name}` : 'All Cabinets'}
                                </span>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                                <SelectItem value="all">All Cabinets</SelectItem>
                                {shelves
                                    .filter(s => !filterTier1Id || filterTier1Id === 'all' || s.cabinetId === filterTier1Id)
                                    .map(s => <SelectItem key={s.id} value={s.id}>{s.code} – {s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <span className="text-slate-700 select-none">|</span>

                        {/* Box */}
                        <Select value={filterBoxId || 'all'} onValueChange={handleFilterBoxChange}>
                            <SelectTrigger className={cn(
                                'h-8 text-xs border-slate-700 text-white w-[160px]',
                                activeBox ? 'bg-amber-500/10 border-amber-500/40' : 'bg-[#1e293b]',
                                (activeDrawer || activeCabinet) ? 'opacity-40 pointer-events-none' : ''
                            )}>
                                <div className="flex items-center gap-1 min-w-0">
                                    <BoxIcon className="h-3 w-3 text-amber-400 flex-shrink-0" />
                                    <span className="truncate">
                                        {activeBox ? `${activeBox.code} – ${activeBox.name}` : 'All Boxes'}
                                    </span>
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                                <SelectItem value="all">All Boxes</SelectItem>
                                {boxes.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.code} – {b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <button onClick={clearAllFilters}
                                className="text-xs text-slate-500 hover:text-white underline underline-offset-2 transition-colors whitespace-nowrap ml-1">
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Row 3 — Active chips + result count (only when filters active) */}
                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 flex-wrap pt-0.5 border-t border-slate-800/60">
                            <Filter className="h-3 w-3 text-slate-600 flex-shrink-0" />
                            {activeDrawer  && <FilterChip color="blue"   label={`Drawer: ${activeDrawer.code} – ${activeDrawer.name}`}   onRemove={() => handleFilterTier1Change('all')} />}
                            {activeCabinet && <FilterChip color="purple" label={`Cabinet: ${activeCabinet.code} – ${activeCabinet.name}`} onRemove={() => handleFilterCabinetChange('all')} />}
                            {activeBox     && <FilterChip color="amber"  label={`Box: ${activeBox.code} – ${activeBox.name}`}             onRemove={() => handleFilterBoxChange('all')} />}
                            {searchQuery   && <FilterChip color="blue"   label={`"${searchQuery}"`}                                        onRemove={() => setSearchQuery('')} />}
                            <span className="text-xs text-slate-500 ml-auto">
                                {filteredFolders.length} / {folders.length} folders
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Table Card ──────────────────────────────────────────────────── */}
            <Card className="border-none bg-[#0f172a] shadow-lg overflow-hidden">
                <CardHeader className="px-4 py-3 border-b border-slate-800 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-amber-400" />
                        Folder List
                        <Badge className="bg-slate-800 text-slate-400 border-slate-700 font-normal text-xs ml-1">
                            {filteredFolders.length}
                        </Badge>
                    </CardTitle>
                    {selectedIds.length > 0 && (
                        <span className="text-xs text-blue-400">{selectedIds.length} selected</span>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="w-[44px] pl-4">
                                        <Checkbox checked={allCurrentSelected}
                                            onCheckedChange={c => handleSelectAll(c as boolean)}
                                            className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                    </TableHead>
                                    <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wide min-w-[180px]">Name</TableHead>
                                    <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wide min-w-[150px]">Parent</TableHead>
                                    <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wide w-[80px]">Code</TableHead>
                                    <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wide w-[110px]">Color</TableHead>
                                    <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wide text-center w-[65px]">Stack</TableHead>
                                    <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wide w-[70px]">Files</TableHead>
                                    <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wide text-right pr-4 w-[190px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFolders.length === 0 ? (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={8} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2 text-slate-500">
                                                <FolderOpen className="h-8 w-8 opacity-20" />
                                                <p className="text-sm">{hasActiveFilters ? 'No folders match the current filters.' : 'No folders yet — add your first one.'}</p>
                                                {hasActiveFilters && (
                                                    <button onClick={clearAllFilters} className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2">Clear filters</button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFolders.map(folder => {
                                        const stats = getFolderStats(folder.id);
                                        const isSelected = selectedIds.includes(folder.id);
                                        return (
                                            <TableRow key={folder.id} className={cn('border-slate-800 transition-colors', isSelected ? 'bg-blue-500/5' : 'hover:bg-[#1e293b]')}>
                                                <TableCell className="pl-4">
                                                    <Checkbox checked={isSelected} onCheckedChange={c => handleSelectOne(folder.id, c as boolean)}
                                                        className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                                </TableCell>

                                                {/* Name */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10"
                                                            style={{ backgroundColor: folder.color || '#3b82f6' }}>
                                                            <FolderOpen className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-white text-sm leading-tight truncate max-w-[150px]" title={folder.name}>{folder.name}</p>
                                                            {folder.description && (
                                                                <p className="text-xs text-slate-500 truncate max-w-[150px]" title={folder.description}>{folder.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Parent */}
                                                <TableCell>
                                                    {folder.boxId ? (
                                                        <div className="flex items-start gap-1.5 min-w-0">
                                                            <BoxIcon className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] text-slate-500 leading-none mb-0.5">Box</p>
                                                                <p className="text-xs text-amber-400 truncate max-w-[120px]" title={(() => { const b = boxes.find((b: any) => b.id === folder.boxId); return b ? `${b.name} (${b.code})` : ''; })()}>
                                                                    {(() => { const b = boxes.find((b: any) => b.id === folder.boxId); return b ? `${b.name} (${b.code})` : 'Unknown'; })()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] text-slate-500 truncate max-w-[130px]" title={getParentDrawerName(folder.shelfId)}>{getParentDrawerName(folder.shelfId)}</p>
                                                            <p className="text-xs text-slate-300 truncate max-w-[130px]" title={getParentCabinetName(folder.shelfId)}>↳ {getParentCabinetName(folder.shelfId)}</p>
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* Code */}
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">{folder.code}</span>
                                                </TableCell>

                                                {/* Color */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-5 w-8 rounded border border-white/10 flex-shrink-0" style={{ backgroundColor: folder.color || '#3b82f6' }} />
                                                        <span className="text-[10px] text-slate-500 font-mono hidden xl:block">{folder.color || '#3b82f6'}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Stack */}
                                                <TableCell className="text-center">
                                                    <span className="text-xs font-mono text-slate-500">{folder.stackNumber ? `#${folder.stackNumber}` : '—'}</span>
                                                </TableCell>

                                                {/* Files */}
                                                <TableCell>
                                                    <span className={cn('text-sm font-medium tabular-nums', stats.files > 0 ? 'text-emerald-400' : 'text-slate-600')}>
                                                        {stats.files}
                                                    </span>
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right pr-4">
                                                    <div className="flex justify-end items-center gap-0.5">
                                                        <Button variant="ghost" size="icon" onClick={() => handleRelocateClick(folder)}
                                                            className="h-8 w-8 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10" title="Update stack position">
                                                            <ArrowUp className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/procurement/list?folderId=${folder.id}`)}
                                                            className="h-8 px-2 text-xs text-emerald-500 hover:text-emerald-300 hover:bg-emerald-500/10">
                                                            <Eye className="h-3.5 w-3.5 mr-1" />Files
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(folder)}
                                                            className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-700">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-500/10">
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="bg-[#1e293b] border-slate-800 text-white">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete "{folder.name}"?</AlertDialogTitle>
                                                                    <AlertDialogDescription asChild>
                                                                        <div className="text-sm">
                                                                            {stats.files > 0 ? (
                                                                                <div className="text-red-400 border border-red-500/20 bg-red-500/10 p-3 rounded-md mt-1">
                                                                                    Cannot delete — contains <strong>{stats.files}</strong> file{stats.files !== 1 ? 's' : ''}. Remove files first.
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-slate-400 mt-1">
                                                                                    Permanently deletes <strong className="text-white">{folder.name}</strong>. This cannot be undone.
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800">Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(folder.id)} disabled={stats.files > 0}
                                                                        className={stats.files > 0 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* ── Relocate Dialog ─────────────────────────────────────────────── */}
            <Dialog open={isRelocateDialogOpen} onOpenChange={setIsRelocateDialogOpen}>
                <DialogContent className="bg-[#0f172a] border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Update Stack Position</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Reorder <strong className="text-white">{relocateFolder?.name}</strong> within its location.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="stackNumber" className="text-slate-300 text-sm">Stack Number</Label>
                        <Input id="stackNumber" type="number" min={0} value={newStackNumber}
                            onChange={e => setNewStackNumber(parseInt(e.target.value) || 0)}
                            className="bg-[#1e293b] border-slate-700 text-white mt-2" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRelocateDialogOpen(false)} className="border-slate-700 text-white hover:bg-slate-800">Cancel</Button>
                        <Button onClick={handleRelocateConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-white">Update Position</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Edit Dialog ─────────────────────────────────────────────────── */}
            <Dialog open={isEditDialogOpen} onOpenChange={o => { setIsEditDialogOpen(o); if (!o) resetForm(); }}>
                <DialogContent className="bg-[#0f172a] border-slate-800 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Folder</DialogTitle>
                        <DialogDescription className="text-slate-400">Update details for this folder.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <ParentSelector
                            parentType={parentType} onParentTypeChange={handleParentTypeChange}
                            selectedTier1Id={selectedTier1Id} onTier1Change={v => { setSelectedTier1Id(v); setSelectedTier2Id(''); setSelectedBoxId(''); }}
                            selectedTier2Id={selectedTier2Id} onTier2Change={v => { setSelectedTier2Id(v); setSelectedBoxId(''); }}
                            selectedBoxId={selectedBoxId} onBoxChange={setSelectedBoxId}
                            cabinets={cabinets} shelves={shelves} boxes={boxes}
                        />
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right text-slate-300 text-sm">Name</Label>
                            <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3 bg-[#1e293b] border-slate-700 text-white" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-code" className="text-right text-slate-300 text-sm">Code</Label>
                            <Input id="edit-code" value={code} onChange={e => setCode(e.target.value)} className="col-span-3 bg-[#1e293b] border-slate-700 text-white" />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right text-slate-300 text-sm mt-2">Color</Label>
                            <ColorPicker color={color} onChange={setColor} idPrefix="edit" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-desc" className="text-right text-slate-300 text-sm">Description</Label>
                            <Textarea id="edit-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="col-span-3 bg-[#1e293b] border-slate-700 text-white" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-700 text-white hover:bg-slate-800">Cancel</Button>
                        <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Folders;