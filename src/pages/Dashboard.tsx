import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { onProcurementsChange, onCabinetsChange, onShelvesChange, onFoldersChange, onBoxesChange, onSuppliersChange } from '@/lib/storage';
import { Procurement, Cabinet, Shelf, Folder, Box } from '@/types/procurement';
import { Supplier } from '@/types/supplier';
import {
    FileText, Archive, Layers, Package, FolderOpen, Clock, TrendingUp,
    Database, Download, AlertCircle, CheckCircle2, BarChart2, Activity,
    Users, Trophy, ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend,
    PieChart, Pie, Cell, LabelList, LineChart, Line, CartesianGrid,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { differenceInCalendarDays, format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

const MONO_COLORS = ['#111827', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'];
const STATUS_COLORS: Record<string, string> = {
    'Completed': '#111827',
    'In Progress': '#374151',
    'Returned PR to EU': '#6B7280',
    'Not yet Acted': '#9CA3AF',
    'Failure': '#D1D5DB',
    'Cancelled': '#E5E7EB',
};
const URGENCY_COLORS: Record<string, string> = {
    'Low': '#9CA3AF',
    'Medium': '#6B7280',
    'High': '#374151',
    'Critical': '#111827',
};
const TYPE_COLORS: Record<string, string> = {
    'SVP': '#111827',
    'Regular Bidding': '#374151',
    'Shopping': '#6B7280',
    'Attendance Sheets': '#9CA3AF',
    'Receipt': '#C4C4C4',
    'Others': '#D1D5DB',
};

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [procurements, setProcurements] = useState<Procurement[]>([]);
    const [cabinets, setCabinets] = useState<Cabinet[]>([]);
    const [shelves, setShelves] = useState<Shelf[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('all');

    useEffect(() => {
        const unsubs = [
            onProcurementsChange(setProcurements),
            onCabinetsChange(setCabinets),
            onShelvesChange(setShelves),
            onFoldersChange(setFolders),
            onBoxesChange(setBoxes),
            onSuppliersChange(setSuppliers),
        ];
        return () => unsubs.forEach(u => u());
    }, []);

    const extractPrYear = (prNumber: string): string | null => {
        const newMatch = prNumber.match(/^(\d{4})-/);
        if (newMatch) return newMatch[1];
        const oldMatch = prNumber.match(/^[A-Za-z]+-[A-Za-z]+-([0-9]{2,4})-/);
        if (oldMatch) {
            const yr = oldMatch[1];
            if (yr.length === 2) return (2000 + parseInt(yr)).toString();
            return yr;
        }
        return null;
    };

    const availableYears = useMemo(() => {
        const years = new Set<string>();
        procurements.forEach(p => {
            const yr = extractPrYear(p.prNumber);
            if (yr) years.add(yr);
            else if (p.createdAt) {
                try { years.add(new Date(p.createdAt).getFullYear().toString()); } catch { }
            }
        });
        return Array.from(years).sort().reverse();
    }, [procurements]);

    const filteredProcurements = useMemo(() => {
        if (selectedYear === 'all') return procurements;
        return procurements.filter(p => {
            const yr = extractPrYear(p.prNumber);
            if (yr) return yr === selectedYear;
            if (p.createdAt) return new Date(p.createdAt).getFullYear().toString() === selectedYear;
            return false;
        });
    }, [selectedYear, procurements]);

    // ── KPIs ────────────────────────────────────────────────────────────
    const kpis = useMemo(() => {
        const total = filteredProcurements.length;
        const completed = filteredProcurements.filter(p => p.procurementStatus === 'Completed').length;
        const inProgress = filteredProcurements.filter(p => p.procurementStatus === 'In Progress').length;
        const borrowed = filteredProcurements.filter(p => p.status === 'active').length;
        const urgent = filteredProcurements.filter(p => {
            if (!p.deadline) return false;
            try { return differenceInCalendarDays(new Date(p.deadline), new Date()) <= 10; } catch { return false; }
        }).length;
        const totalAbc = filteredProcurements.reduce((sum, p) => sum + (p.abc || 0), 0);
        const cancelled = filteredProcurements.filter(p => p.procurementStatus === 'Cancelled').length;
        const notActed = filteredProcurements.filter(p => !p.procurementStatus || p.procurementStatus === 'Not yet Acted').length;
        return { total, completed, inProgress, borrowed, urgent, totalAbc, cancelled, notActed };
    }, [filteredProcurements]);

    // ── Procurement Type breakdown ───────────────────────────────────────
    const typeData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredProcurements.forEach(p => {
            const type = p.procurementType || 'Unknown';
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value, fill: TYPE_COLORS[name] || '#9CA3AF' }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [filteredProcurements]);

    // ── Process status breakdown ─────────────────────────────────────────
    const statusData = useMemo(() => {
        const statuses = ['Completed', 'In Progress', 'Returned PR to EU', 'Not yet Acted', 'Failure', 'Cancelled'];
        return statuses.map(s => ({
            name: s === 'Returned PR to EU' ? 'Returned' : s,
            value: filteredProcurements.filter(p =>
                s === 'Not yet Acted'
                    ? (!p.procurementStatus || p.procurementStatus === 'Not yet Acted')
                    : p.procurementStatus === s
            ).length,
            fill: STATUS_COLORS[s],
        })).filter(d => d.value > 0);
    }, [filteredProcurements]);

    // ── Urgency breakdown ────────────────────────────────────────────────
    const urgencyData = useMemo(() => (
        ['Low', 'Medium', 'High', 'Critical'].map(u => ({
            name: u,
            value: filteredProcurements.filter(p => p.urgencyLevel === u).length,
            fill: URGENCY_COLORS[u],
        })).filter(d => d.value > 0)
    ), [filteredProcurements]);

    // ── Monthly trend (last 6 months) ────────────────────────────────────
    const monthlyTrend = useMemo(() => {
        const now = new Date();
        const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
        return months.map(m => ({
            month: format(m, 'MMM yy'),
            Added: procurements.filter(p => {
                if (!p.createdAt) return false;
                const d = new Date(p.createdAt);
                return d >= startOfMonth(m) && d <= endOfMonth(m);
            }).length,
            Completed: procurements.filter(p => {
                if (!p.createdAt) return false;
                const d = new Date(p.createdAt);
                return d >= startOfMonth(m) && d <= endOfMonth(m) && p.procurementStatus === 'Completed';
            }).length,
        }));
    }, [procurements]);

    // ── Storage top ──────────────────────────────────────────────────────
    const storageData = useMemo(() => {
        const drawerData = cabinets.map(c => ({
            name: c.code,
            Files: filteredProcurements.filter(p => p.cabinetId === c.id).length,
        }));
        const boxData = boxes.map(b => ({
            name: b.code || b.name,
            Files: filteredProcurements.filter(p => p.boxId === b.id).length,
        }));
        return [...drawerData, ...boxData].filter(d => d.Files > 0).sort((a, b) => b.Files - a.Files).slice(0, 8);
    }, [cabinets, boxes, filteredProcurements]);

    // ── Supplier Leaderboard Top 5 ───────────────────────────────────────
    const supplierLeaderboard = useMemo(() => {
        return suppliers.map(s => ({
            ...s,
            awarded: filteredProcurements.filter(p =>
                p.supplier?.trim().toLowerCase() === s.name.trim().toLowerCase() &&
                p.procurementStatus === 'Completed'
            ).length,
        }))
            .filter(s => s.awarded > 0)
            .sort((a, b) => b.awarded - a.awarded)
            .slice(0, 5);
    }, [suppliers, filteredProcurements]);

    // ── Urgent records ───────────────────────────────────────────────────
    const urgentRecords = useMemo(() => filteredProcurements
        .filter(p => p.urgencyLevel === 'Critical' || p.urgencyLevel === 'High')
        .sort((a, b) => {
            if (a.urgencyLevel !== b.urgencyLevel) return a.urgencyLevel === 'Critical' ? -1 : 1;
            if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            if (a.deadline) return -1;
            if (b.deadline) return 1;
            return 0;
        })
        .slice(0, 5),
        [filteredProcurements]);

    // ── Recent activity ──────────────────────────────────────────────────
    const recentActivity = useMemo(() => [...filteredProcurements]
        .sort((a, b) => new Date(b.createdAt || b.dateAdded).getTime() - new Date(a.createdAt || a.dateAdded).getTime())
        .slice(0, 6),
        [filteredProcurements]);

    const getDaysLeft = (deadline?: string) => {
        if (!deadline) return null;
        try {
            const days = differenceInCalendarDays(new Date(deadline), new Date());
            if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: 'text-destructive' };
            if (days === 0) return { label: 'Due today', color: 'text-destructive font-bold' };
            if (days <= 3) return { label: `${days}d left`, color: 'text-orange-600 dark:text-orange-400' };
            if (days <= 7) return { label: `${days}d left`, color: 'text-amber-600 dark:text-amber-400' };
            return { label: `${days}d left`, color: 'text-muted-foreground' };
        } catch { return null; }
    };

    const formatCurrency = (val: number) => {
        if (val >= 1_000_000) return `₱${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `₱${(val / 1_000).toFixed(0)}K`;
        return `₱${val.toLocaleString()}`;
    };

    // ── KPI Card ─────────────────────────────────────────────────────────
    const KpiCard = ({ title, value, icon: Icon, sub, onClick }: { title: string; value: string | number; icon: any; sub?: string; onClick?: () => void }) => (
        <button
            onClick={onClick}
            className={cn('kpi-card text-left w-full', onClick && 'cursor-pointer hover:shadow-md')}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1 leading-none">{value}</p>
                    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
                </div>
                <div className="h-9 w-9 rounded-md bg-foreground/5 flex items-center justify-center shrink-0">
                    <Icon className="h-4.5 w-4.5 text-foreground/60" />
                </div>
            </div>
        </button>
    );

    const CustomTooltipStyle = {
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        fontSize: '11px',
        color: 'hsl(var(--foreground))',
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Analytics overview {selectedYear !== 'all' && `· ${selectedYear}`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {availableYears.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={async () => {
                            const el = document.getElementById('dashboard-print');
                            if (!el) return;
                            try {
                                const canvas = await html2canvas(el as HTMLElement, { scale: 1.5, backgroundColor: '#fff' });
                                const pdf = new jsPDF('l', 'mm', 'a3');
                                const pw = pdf.internal.pageSize.getWidth();
                                const ph = pdf.internal.pageSize.getHeight();
                                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pw, (canvas.height * pw) / canvas.width);
                                pdf.save(`dashboard-${selectedYear}.pdf`);
                                toast.success('Dashboard exported');
                            } catch { toast.error('Export failed'); }
                        }}
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <div id="dashboard-print" className="space-y-6">
                {/* ── KPI Row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <KpiCard title="Total Records" value={kpis.total} icon={Database} onClick={() => navigate('/procurement?tab=records')} />
                    <KpiCard title="Completed" value={kpis.completed} icon={CheckCircle2} sub={kpis.total ? `${Math.round(kpis.completed / kpis.total * 100)}%` : '—'} />
                    <KpiCard title="In Progress" value={kpis.inProgress} icon={Activity} />
                    <KpiCard title="Borrowed" value={kpis.borrowed} icon={FileText} />
                    <KpiCard title="Urgent / Due" value={kpis.urgent} icon={AlertCircle} onClick={() => navigate('/urgent-records')} />
                    <KpiCard title="Total ABC" value={formatCurrency(kpis.totalAbc)} icon={TrendingUp} />
                </div>

                {/* ── Storage summary row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Drawers', val: cabinets.length, icon: Layers },
                        { label: 'Cabinets', val: shelves.length, icon: Archive },
                        { label: 'Folders', val: folders.length, icon: FolderOpen },
                        { label: 'Boxes', val: boxes.length, icon: Package },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                                <div className="h-8 w-8 rounded-md bg-foreground/5 flex items-center justify-center">
                                    <Icon className="h-4 w-4 text-foreground/50" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-foreground leading-none">{s.val}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Charts Row 1 ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Monthly trend */}
                    <Card className="lg:col-span-2 border border-border">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                                <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                                Monthly Trend (last 6 months)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} dx={-10} />
                                        <Tooltip contentStyle={CustomTooltipStyle} />
                                        <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                                        <Line type="monotone" dataKey="Added" stroke="#111827" strokeWidth={1.5} dot={{ r: 3 }} activeDot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="Completed" stroke="#6B7280" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Procurement Type */}
                    <Card className="border border-border">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                Type Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="h-[280px]">
                                {typeData.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                                            <Pie data={typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                                                {typeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                                <LabelList dataKey="value" position="inside" fill="#fff" stroke="none" fontSize={12} fontWeight="600" />
                                            </Pie>
                                            <Tooltip contentStyle={CustomTooltipStyle} />
                                            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Charts Row 2 ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Process Status */}
                    <Card className="border border-border">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                                Process Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="h-[240px]">
                                {statusData.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                            <XAxis type="number" fontSize={10} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} allowDecimals={false} hide />
                                            <YAxis type="category" dataKey="name" fontSize={10} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={85} />
                                            <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                                                {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                                <LabelList dataKey="value" position="right" fill="hsl(var(--foreground))" fontSize={11} fontWeight="500" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Storage Files Distribution */}
                    <Card className="border border-border">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                Files by Storage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="h-[260px]">
                                {storageData.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={storageData} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
                                            <XAxis dataKey="name" fontSize={10} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} dy={10} />
                                            <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} allowDecimals={false} dx={-10} />
                                            <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                                            <Bar dataKey="Files" fill="#111827" radius={[4, 4, 0, 0]} barSize={24}>
                                                <LabelList dataKey="Files" position="top" fill="hsl(var(--muted-foreground))" fontSize={10} fontWeight="500" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Urgency Distribution */}
                    <Card className="border border-border">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                Urgency Levels
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="h-[260px] flex flex-col justify-center gap-4">
                                {urgencyData.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No data</div>
                                ) : urgencyData.map(u => (
                                    <div key={u.name} className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground w-14 shrink-0">{u.name}</span>
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${kpis.total ? (u.value / kpis.total) * 100 : 0}%`,
                                                    background: u.fill
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-foreground w-6 text-right">{u.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Bottom Row: Recent Activity + Urgent + Supplier Leaderboard ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Recent Activity */}
                    <Card className="lg:col-span-1 border border-border">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    Recent Records
                                </span>
                                <button
                                    onClick={() => navigate('/procurement?tab=records')}
                                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                                >
                                    View all <ChevronRight className="h-3 w-3" />
                                </button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-2">
                            {recentActivity.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-4 text-center">No records</p>
                            ) : recentActivity.map(p => (
                                <div key={p.id} className="flex items-start gap-2.5 py-1.5 border-b border-border last:border-0">
                                    <div className={cn(
                                        'h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                                        p.status === 'active' ? 'bg-foreground/10' : 'bg-foreground/5'
                                    )}>
                                        <FileText className="h-2.5 w-2.5 text-foreground/50" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-foreground truncate">{p.prNumber}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{p.projectName || p.description}</p>
                                    </div>
                                    <span className={cn(
                                        'text-[10px] px-1.5 py-0.5 rounded-full shrink-0',
                                        p.status === 'active'
                                            ? 'bg-foreground/10 text-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    )}>
                                        {p.status === 'active' ? 'Borrowed' : 'Stored'}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Urgent Records */}
                    <Card className="border border-border">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                    Urgent Records
                                </span>
                                <button
                                    onClick={() => navigate('/urgent-records')}
                                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                                >
                                    View all <ChevronRight className="h-3 w-3" />
                                </button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-2">
                            {urgentRecords.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 gap-1 text-muted-foreground/40">
                                    <CheckCircle2 className="h-6 w-6" />
                                    <p className="text-xs">No urgent records</p>
                                </div>
                            ) : urgentRecords.map(p => {
                                const dl = getDaysLeft(p.deadline);
                                return (
                                    <div key={p.id} className={cn(
                                        'flex items-start gap-2.5 py-1.5 border-b border-border last:border-0'
                                    )}>
                                        <div className={cn(
                                            'h-1.5 w-1.5 rounded-full mt-2 shrink-0',
                                            p.urgencyLevel === 'Critical' ? 'bg-foreground' : 'bg-foreground/50'
                                        )} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-foreground truncate">{p.prNumber}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{p.projectName || p.description || '—'}</p>
                                        </div>
                                        {dl && <span className={cn('text-[10px] shrink-0', dl.color)}>{dl.label}</span>}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Supplier Leaderboard */}
                    <Card className="border border-border">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                                    Supplier Leaders
                                </span>
                                <button
                                    onClick={() => navigate('/suppliers')}
                                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                                >
                                    View all <ChevronRight className="h-3 w-3" />
                                </button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-2">
                            {supplierLeaderboard.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-4 text-center">No awarded suppliers yet</p>
                            ) : supplierLeaderboard.map((s, i) => (
                                <div key={s.id} className="flex items-center gap-2.5 py-1.5 border-b border-border last:border-0">
                                    <span className={cn(
                                        'text-xs font-bold w-5 text-center shrink-0',
                                        i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'text-muted-foreground'
                                    )}>
                                        #{i + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-foreground truncate">{s.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{s.awarded} awarded project{s.awarded !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="h-1 w-12 rounded-full bg-muted overflow-hidden shrink-0">
                                        <div
                                            className="h-full rounded-full bg-foreground/70"
                                            style={{ width: `${(s.awarded / (supplierLeaderboard[0]?.awarded || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;