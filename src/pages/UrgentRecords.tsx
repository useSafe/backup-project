import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import { AlertCircle, Search, Eye, Filter, CalendarClock, Save, X, Pencil, CalendarIcon, RotateCcw } from 'lucide-react';
import ProcurementDetailsDialog from '../components/procurement/ProcurementDetailsDialog';
import { Procurement, UrgencyLevel } from '../types/procurement';
import { format, differenceInCalendarDays } from 'date-fns';
import { updateProcurement } from '../lib/storage';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function UrgentRecords() {
    const { procurements, cabinets, shelves, folders, boxes } = useData();
    const { user } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterUrgency, setFilterUrgency] = useState<string>('all');
    const [selectedRecord, setSelectedRecord] = useState<Procurement | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Inline editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editUrgency, setEditUrgency] = useState<UrgencyLevel>('Low');
    const [editDeadline, setEditDeadline] = useState<Date | undefined>(undefined);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Reset confirmation state
    const [confirmResetId, setConfirmResetId] = useState<string | null>(null);

    const filteredRecords = useMemo(() => {
        let result = [...procurements];

        if (filterUrgency !== 'all') {
            result = result.filter(p => p.urgencyLevel === filterUrgency);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.prNumber.toLowerCase().includes(query) ||
                (p.projectName && p.projectName.toLowerCase().includes(query)) ||
                (p.division && p.division.toLowerCase().includes(query))
            );
        }

        const urgencyWeight: Record<string, number> = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'Done': 0 };
        result.sort((a, b) => {
            const wA = urgencyWeight[a.urgencyLevel || 'Low'] || 0;
            const wB = urgencyWeight[b.urgencyLevel || 'Low'] || 0;
            if (wB !== wA) return wB - wA;
            return new Date(b.createdAt || b.dateAdded).getTime() - new Date(a.createdAt || a.dateAdded).getTime();
        });

        return result;
    }, [procurements, filterUrgency, searchQuery]);

    // Pagination
    const itemsPerPage = 15;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRecords.slice(start, start + itemsPerPage);
    }, [filteredRecords, currentPage]);

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filterUrgency, searchQuery]);

    const getUrgencyBadge = (level?: string) => {
        switch (level) {
            case 'Critical': return <Badge className="bg-red-500/15 text-red-400 border-red-500/30 font-semibold">🔴 Critical</Badge>;
            case 'High': return <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 font-semibold">🟠 High</Badge>;
            case 'Medium': return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold">🟡 Medium</Badge>;
            case 'Low': return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 font-semibold">🔵 Low</Badge>;
            case 'None': return <Badge className="bg-gray-500/15 text-gray-400 border-gray-500/30 font-semibold">⚫ None</Badge>;
            case 'Done': return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold">✅ Done</Badge>;
            default: return <Badge className="bg-slate-700/60 text-slate-500 border-slate-700/60">—</Badge>;
        }
    };

    const getDaysLeft = (deadline?: string, urgencyLevel?: string) => {
        if (urgencyLevel === 'Done') return { label: '✅ Completed', color: 'text-emerald-400 font-semibold' };
        if (!deadline) return null;
        try {
            const days = differenceInCalendarDays(new Date(deadline), new Date());
            if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: 'text-red-400 font-semibold' };
            if (days === 0) return { label: 'Due today!', color: 'text-red-400 font-bold animate-pulse' };
            if (days <= 3) return { label: `${days}d left`, color: 'text-orange-400 font-semibold' };
            if (days <= 7) return { label: `${days}d left`, color: 'text-amber-400 font-semibold' };
            return { label: `${days}d left`, color: 'text-slate-400' };
        } catch { return null; }
    };

    const getLocationString = (p: Procurement) => {
        const cabinet = cabinets.find(c => c.id === p.cabinetId);
        const shelf = shelves.find(s => s.id === p.shelfId);
        const box = p.boxId ? boxes.find(b => b.id === p.boxId) : null;
        const folder = folders.find(f => f.id === p.folderId);
        if (box && folder) return `${box.code} → ${folder.code}`;
        if (cabinet && shelf && folder) return `${cabinet.code} → ${shelf.code} → ${folder.code}`;
        return 'Unknown Location';
    };

    const handleStartEdit = (record: Procurement) => {
        setEditingId(record.id);
        setEditUrgency(record.urgencyLevel || 'Low');
        setEditDeadline(record.deadline ? new Date(record.deadline) : undefined);
        setCalendarOpen(false);
        setConfirmResetId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditDeadline(undefined);
        setCalendarOpen(false);
        setConfirmResetId(null);
    };

    const handleSaveEdit = async (record: Procurement) => {
        setSaving(true);
        try {
            await updateProcurement(record.id, {
                urgencyLevel: editUrgency,
                deadline: editDeadline ? editDeadline.toISOString().slice(0, 10) : undefined,
                editedBy: user?.id,
                editedByName: user?.name,
                lastEditedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            toast.success(`Urgency updated for ${record.prNumber}`);
            setEditingId(null);
            setEditDeadline(undefined);
        } catch (err) {
            toast.error('Failed to update urgency. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Erases urgency, deadline (and days left is derived) back to blank
    const handleResetToDefault = async (record: Procurement) => {
        setSaving(true);
        try {
            await updateProcurement(record.id, {
                urgencyLevel: null as any,
                deadline: null as any,
                editedBy: user?.id,
                editedByName: user?.name,
                lastEditedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            toast.success(`Reset to default for ${record.prNumber}`);
            setEditingId(null);
            setEditDeadline(undefined);
            setConfirmResetId(null);
        } catch (err) {
            toast.error('Failed to reset record. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleView = (record: Procurement) => {
        setSelectedRecord(record);
        setIsDetailsOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                        Urgent Records
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">Set urgency levels and action deadlines for procurement records.</p>
                </div>
                {/* Quick filter badges */}
                <div className="flex flex-wrap gap-2">
                    {(['Critical', 'High', 'Medium', 'Low', 'Done'] as UrgencyLevel[]).map(lvl => {
                        const count = procurements.filter(p => p.urgencyLevel === lvl).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={lvl}
                                onClick={() => setFilterUrgency(filterUrgency === lvl ? 'all' : lvl)}
                                className={cn(
                                    'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                                    filterUrgency === lvl ? 'ring-2 ring-offset-1 ring-offset-[#0f172a]' : 'opacity-70 hover:opacity-100',
                                    lvl === 'Critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                                        lvl === 'High' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                                            lvl === 'Medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                                                lvl === 'Done' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                                                    'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                )}
                            >
                                {lvl === 'Done' ? '✅' : ''} {lvl} ({count})
                            </button>
                        );
                    })}
                    {filterUrgency !== 'all' && (
                        <button
                            onClick={() => setFilterUrgency('all')}
                            className="px-3 py-1 rounded-full text-xs font-semibold border border-slate-700 bg-slate-800 text-slate-400 hover:text-white transition-all"
                        >
                            Clear ×
                        </button>
                    )}
                </div>
            </div>

            {/* Main Table Card */}
            <Card className="bg-[#1e293b] border-slate-800 text-white">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center w-full">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-amber-400" />
                            Priority List
                            <span className="text-slate-500 text-sm font-normal">({filteredRecords.length} records)</span>
                        </CardTitle>
                        <div className="flex flex-1 sm:flex-none gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search PR / Project..."
                                    className="pl-9 bg-[#0f172a] border-slate-700 text-white w-full h-9"
                                />
                            </div>
                            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                                <SelectTrigger className="w-[150px] bg-[#0f172a] border-slate-700 h-9 text-white">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                                        <SelectValue placeholder="All Levels" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="Critical">🔴 Critical</SelectItem>
                                    <SelectItem value="High">🟠 High</SelectItem>
                                    <SelectItem value="Medium">🟡 Medium</SelectItem>
                                    <SelectItem value="Low">🔵 Low</SelectItem>
                                    <SelectItem value="None">⚫ None</SelectItem>
                                    <SelectItem value="Done">✅ Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto border-t border-slate-800">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#0f172a] text-slate-400 text-xs uppercase border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3 font-medium">PR Number</th>
                                    <th className="px-4 py-3 font-medium">Project Name</th>
                                    <th className="px-4 py-3 font-medium">End User</th>
                                    <th className="px-4 py-3 font-medium">Urgency</th>
                                    <th className="px-4 py-3 font-medium">Deadline</th>
                                    <th className="px-4 py-3 font-medium">Days Left</th>
                                    <th className="px-4 py-3 font-medium text-right pr-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            No records found. All procurement records appear here.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRecords.map((record) => {
                                        const isEditing = editingId === record.id;
                                        const isConfirmingReset = confirmResetId === record.id;
                                        const daysLeft = getDaysLeft(record.deadline, record.urgencyLevel);
                                        const previewDays = isEditing ? getDaysLeft(editDeadline?.toISOString().slice(0, 10), editUrgency) : null;

                                        // A record is considered "set" if it has any urgency or deadline
                                        const hasUrgencyOrDeadline = !!(record.urgencyLevel || record.deadline);

                                        return (
                                            <tr key={record.id} className={cn(
                                                'transition-all duration-150',
                                                isEditing ? 'bg-slate-800/60 shadow-inner' : 'hover:bg-slate-800/25'
                                            )}>
                                                <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">{record.prNumber}</td>
                                                <td className="px-4 py-3 text-slate-300 max-w-[180px] truncate" title={record.projectName}>
                                                    {record.projectName || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-xs">{record.division || '—'}</td>

                                                {/* Urgency */}
                                                <td className="px-4 py-3">
                                                    {isEditing ? (
                                                        <Select value={editUrgency} onValueChange={(v: any) => setEditUrgency(v)}>
                                                            <SelectTrigger className="w-[130px] h-8 bg-[#0f172a] border-slate-600 text-white text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-[#1e293b] border-slate-700 text-white text-xs">
                                                                <SelectItem value="Critical">🔴 Critical</SelectItem>
                                                                <SelectItem value="High">🟠 High</SelectItem>
                                                                <SelectItem value="Medium">🟡 Medium</SelectItem>
                                                                <SelectItem value="Low">🔵 Low</SelectItem>
                                                                <SelectItem value="None">⚫ None</SelectItem>
                                                                <SelectItem value="Done">✅ Done</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : getUrgencyBadge(record.urgencyLevel)}
                                                </td>

                                                {/* Deadline — Popover Calendar in edit mode */}
                                                <td className="px-4 py-3">
                                                    {isEditing ? (
                                                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'h-8 w-[152px] justify-start gap-2 text-left text-xs font-normal bg-[#0f172a] border-slate-600 text-white hover:bg-slate-800 hover:text-white',
                                                                        !editDeadline && 'text-slate-500'
                                                                    )}
                                                                >
                                                                    <CalendarIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                                                    {editDeadline ? format(editDeadline, 'MMM d, yyyy') : 'Pick a date'}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent
                                                                className="w-auto p-0 bg-[#1e293b] border-slate-700 shadow-2xl"
                                                                align="start"
                                                            >
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={editDeadline}
                                                                    onSelect={(d) => {
                                                                        setEditDeadline(d);
                                                                        setCalendarOpen(false);
                                                                    }}
                                                                    initialFocus
                                                                />
                                                                {editDeadline && (
                                                                    <div className="p-2 border-t border-slate-700 flex justify-end">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-7 text-xs text-slate-400 hover:text-red-400"
                                                                            onClick={() => { setEditDeadline(undefined); setCalendarOpen(false); }}
                                                                        >
                                                                            Clear date
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </PopoverContent>
                                                        </Popover>
                                                    ) : (
                                                        <span className="text-slate-300 text-xs font-mono">
                                                            {record.deadline ? format(new Date(record.deadline), 'MMM d, yyyy') : '—'}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Days Left */}
                                                <td className="px-4 py-3">
                                                    {isEditing ? (
                                                        previewDays ? (
                                                            <span className={cn('text-xs', previewDays.color)}>{previewDays.label}</span>
                                                        ) : <span className="text-slate-600 text-xs">—</span>
                                                    ) : daysLeft ? (
                                                        <span className={cn('text-xs', daysLeft.color)}>{daysLeft.label}</span>
                                                    ) : (
                                                        <span className="text-slate-600 text-xs">—</span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex gap-1.5 justify-end items-center">
                                                        {isEditing ? (
                                                            <>
                                                                {/* Reset to Default — with inline confirmation */}
                                                                {isConfirmingReset ? (
                                                                    <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700 rounded-md px-2 py-1">
                                                                        <span className="text-xs text-slate-300 whitespace-nowrap">Reset all?</span>
                                                                        <Button
                                                                            variant="ghost" size="sm"
                                                                            onClick={() => handleResetToDefault(record)}
                                                                            disabled={saving}
                                                                            className="h-6 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                                        >
                                                                            Yes
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost" size="sm"
                                                                            onClick={() => setConfirmResetId(null)}
                                                                            className="h-6 px-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700"
                                                                        >
                                                                            No
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <Button
                                                                        variant="ghost" size="sm"
                                                                        onClick={() => setConfirmResetId(record.id)}
                                                                        disabled={saving || !hasUrgencyOrDeadline}
                                                                        title="Reset urgency & deadline to default"
                                                                        className={cn(
                                                                            'h-8 w-8 p-0 transition-colors',
                                                                            hasUrgencyOrDeadline
                                                                                ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                                                                                : 'text-slate-700 cursor-not-allowed'
                                                                        )}
                                                                    >
                                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    variant="ghost" size="sm"
                                                                    onClick={() => handleSaveEdit(record)}
                                                                    disabled={saving}
                                                                    title="Save"
                                                                    className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                                                                >
                                                                    <Save className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost" size="sm"
                                                                    onClick={handleCancelEdit}
                                                                    title="Cancel"
                                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="ghost" size="sm"
                                                                    onClick={() => handleStartEdit(record)}
                                                                    title="Set Urgency / Deadline"
                                                                    className="h-8 w-8 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost" size="sm"
                                                                    onClick={() => handleView(record)}
                                                                    title="View Details"
                                                                    className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="bg-[#1e293b] border-slate-700 text-white hover:bg-slate-800"
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-slate-400">
                        Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-[#1e293b] border-slate-700 text-white hover:bg-slate-800"
                    >
                        Next
                    </Button>
                </div>
            )}

            {selectedRecord && (
                <ProcurementDetailsDialog
                    open={isDetailsOpen}
                    onOpenChange={(open) => {
                        setIsDetailsOpen(open);
                        if (!open) setSelectedRecord(null);
                    }}
                    procurement={selectedRecord}
                    getLocationString={getLocationString}
                />
            )}
        </div>
    );
}