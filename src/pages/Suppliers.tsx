import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
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
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
    Plus, Search, Pencil, Trash2, Phone, Mail, Building, MapPin,
    Users, Trophy, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { onSuppliersChange, addSupplier, updateSupplier, deleteSupplier } from '@/lib/storage';
import { Supplier } from '@/types/supplier';
import { useData } from '@/contexts/DataContext';

// ─── Supplier Form (shared between Add and Edit) ──────────────────────────────
interface SupplierFormData {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
}

const emptyForm = (): SupplierFormData => ({
    name: '', contactPerson: '', email: '', phone: '', address: '',
});

function SupplierForm({
    data, onChange,
}: { data: SupplierFormData; onChange: (d: SupplierFormData) => void }) {
    return (
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label className="text-slate-300">Company Name <span className="text-red-400">*</span></Label>
                <Input required value={data.name}
                    onChange={e => onChange({ ...data, name: e.target.value })}
                    className="bg-[#0f172a] border-slate-700 text-white"
                    placeholder="e.g. Acme Corp" />
            </div>
            <div className="space-y-2">
                <Label className="text-slate-300">Contact Person</Label>
                <Input value={data.contactPerson}
                    onChange={e => onChange({ ...data, contactPerson: e.target.value })}
                    className="bg-[#0f172a] border-slate-700 text-white"
                    placeholder="e.g. John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-slate-300">Email</Label>
                    <Input type="email" value={data.email}
                        onChange={e => onChange({ ...data, email: e.target.value })}
                        className="bg-[#0f172a] border-slate-700 text-white"
                        placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-300">Phone</Label>
                    <Input value={data.phone}
                        onChange={e => onChange({ ...data, phone: e.target.value })}
                        className="bg-[#0f172a] border-slate-700 text-white"
                        placeholder="+63 ..." />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-slate-300">Address</Label>
                <Input value={data.address}
                    onChange={e => onChange({ ...data, address: e.target.value })}
                    className="bg-[#0f172a] border-slate-700 text-white"
                    placeholder="Full Address" />
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Suppliers() {
    const { user } = useAuth();
    const { procurements } = useData();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [search, setSearch] = useState('');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<SupplierFormData>(emptyForm());

    useEffect(() => {
        const unsub = onSuppliersChange(setSuppliers);
        return () => unsub();
    }, []);

    const resetForm = () => { setFormData(emptyForm()); setEditingId(null); };

    const toPayload = (d: SupplierFormData) => ({
        name: d.name,
        contactPerson: d.contactPerson,
        email: d.email,
        phone: d.phone,
        address: d.address,
    });

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addSupplier(toPayload(formData));
            toast.success('Supplier added successfully');
            setIsAddOpen(false);
            resetForm();
        } catch (error) {
            toast.error('Failed to add supplier');
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        try {
            await updateSupplier(editingId, toPayload(formData));
            toast.success('Supplier updated successfully');
            setIsEditOpen(false);
            resetForm();
        } catch (error) {
            toast.error('Failed to update supplier');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSupplier(id);
            toast.success('Supplier deleted successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete supplier');
        }
    };

    const openEdit = (s: Supplier) => {
        setEditingId(s.id);
        setFormData({
            name: s.name,
            contactPerson: s.contactPerson || '',
            email: s.email || '',
            phone: s.phone || '',
            address: s.address || '',
        });
        setIsEditOpen(true);
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => a.name.localeCompare(b.name));

    const canEdit = !['viewer', 'archiver'].includes(user?.role || '');

    // Get stats for a supplier dynamically
    const getSupplierStats = (supplierName: string) => {
        // We match by name since that's what's saved in procurement.supplier
        const supplierProcs = procurements.filter(p =>
            p.supplier?.trim().toLowerCase() === supplierName.trim().toLowerCase()
        );
        const awarded = supplierProcs.filter(p => p.procurementStatus === 'Completed').length;
        const failed = supplierProcs.filter(p => p.procurementStatus === 'Failure').length;
        return { awarded, failed };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
                        <Users className="h-7 w-7 text-blue-400" />
                        Suppliers
                    </h1>
                    <p className="text-slate-400 text-sm">Manage vendors, suppliers, and external contacts.</p>
                </div>

                {canEdit && (
                    <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 gap-2">
                                <Plus className="w-4 h-4" />
                                Add Supplier
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1e293b] border-slate-700 text-white sm:max-w-[500px]">
                            <form onSubmit={handleAddSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Add New Supplier</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Enter the details of the new supplier or vendor.
                                    </DialogDescription>
                                </DialogHeader>
                                <SupplierForm data={formData} onChange={setFormData} />
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="text-slate-300 hover:text-white">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                        Save Supplier
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Table Card */}
            <Card className="bg-[#0f172a] border-slate-800 shadow-xl">
                <CardHeader className="border-b border-slate-800 pb-4">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search suppliers by name, contact, or email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 bg-[#1e293b] border-slate-700 text-white focus-visible:ring-blue-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-300">Supplier / Company</TableHead>
                                    <TableHead className="text-slate-300">Contact Details</TableHead>
                                    <TableHead className="text-slate-300">Address</TableHead>
                                    <TableHead className="text-center text-slate-300">Awarded Projects</TableHead>
                                    <TableHead className="text-center text-slate-300">Failed Projects</TableHead>
                                    <TableHead className="text-slate-300">Added</TableHead>
                                    <TableHead className="text-right text-slate-300 w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSuppliers.length === 0 ? (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                            No suppliers found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSuppliers.map((supplier) => {
                                        const stats = getSupplierStats(supplier.name);
                                        return (
                                            <TableRow key={supplier.id} className="border-slate-800 border-b hover:bg-slate-800/50 transition-colors">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-white flex items-center gap-2">
                                                            <Building className="w-4 h-4 text-blue-400 shrink-0" />
                                                            {supplier.name}
                                                        </span>
                                                        {supplier.contactPerson && (
                                                            <span className="text-xs text-slate-400 mt-0.5 pl-6">Attn: {supplier.contactPerson}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-xs text-slate-300">
                                                        {supplier.email && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                                                {supplier.email}
                                                            </span>
                                                        )}
                                                        {supplier.phone && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                                                {supplier.phone}
                                                            </span>
                                                        )}
                                                        {!supplier.email && !supplier.phone && (
                                                            <span className="text-slate-600 italic">No contact details</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-300 text-xs">
                                                    {supplier.address ? (
                                                        <span className="flex items-start gap-1 max-w-[220px]">
                                                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                                            <span className="truncate" title={supplier.address}>{supplier.address}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600 italic">No address</span>
                                                    )}
                                                </TableCell>

                                                {/* Stats Columns */}
                                                <TableCell className="text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stats.awarded > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                                        <Trophy className="w-3 h-3" />
                                                        {stats.awarded}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stats.failed > 0 ? 'bg-red-500/15 text-red-400' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                                        <XCircle className="w-3 h-3" />
                                                        {stats.failed}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="text-slate-400 text-xs">
                                                    {supplier.createdAt ? format(new Date(supplier.createdAt), 'MMM d, yyyy') : '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {canEdit && (
                                                        <div className="flex justify-end gap-1.5">
                                                            <Button variant="ghost" size="icon"
                                                                onClick={() => openEdit(supplier)}
                                                                className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon"
                                                                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="bg-[#1e293b] border-slate-800 text-white">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Supplier?</AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-slate-400">
                                                                            Are you sure you want to delete <strong>{supplier.name}</strong>? This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800">Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDelete(supplier.id)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    )}
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

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="bg-[#1e293b] border-slate-700 text-white sm:max-w-[500px]">
                    <form onSubmit={handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Supplier</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Update the details of the supplier.
                            </DialogDescription>
                        </DialogHeader>
                        <SupplierForm data={formData} onChange={setFormData} />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="text-slate-300 hover:text-white">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
