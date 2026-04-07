import React, { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Activity } from 'lucide-react';
import AddProcurement from './AddProcurement';
import ProcurementList from './ProcurementList';
import ProgressTracking from './ProgressTracking';
import { useAuth } from '@/contexts/AuthContext';

const TABS = [
    { value: 'records', label: 'Records', icon: FileText, roles: null },
    { value: 'add', label: 'Add', icon: Plus, roles: ['admin', 'bac-staff'] },
    { value: 'tracking', label: 'Tracking', icon: Activity, roles: ['admin', 'bac-staff', 'viewer'] },
];

export default function ProcurementHub() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const activeTab = searchParams.get('tab') || 'records';

    const handleTabChange = (value: string) => {
        // Preserve any other search params when switching tabs
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('tab', value);
            // Clear action-specific params when switching tabs
            next.delete('action');
            next.delete('id');
            return next;
        });
    };

    const visibleTabs = TABS.filter(tab =>
        !tab.roles || tab.roles.includes(user?.role || '')
    );

    // Default to records if active tab isn't accessible
    const resolvedTab = visibleTabs.some(t => t.value === activeTab) ? activeTab : 'records';

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div>
                <h1 className="text-xl font-semibold text-foreground">Procurement</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage procurement records — add, view, and track progress.</p>
            </div>

            <Tabs value={resolvedTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="h-9 rounded-md border border-border bg-muted/50 p-0.5">
                    {visibleTabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="flex items-center gap-1.5 text-xs h-full px-4 rounded data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                <TabsContent value="records" className="mt-0">
                    <Suspense fallback={<div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Loading records...</div>}>
                        <ProcurementList />
                    </Suspense>
                </TabsContent>

                <TabsContent value="add" className="mt-0">
                    <Suspense fallback={<div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Loading form...</div>}>
                        <AddProcurement />
                    </Suspense>
                </TabsContent>

                <TabsContent value="tracking" className="mt-0">
                    <Suspense fallback={<div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Loading tracking...</div>}>
                        <ProgressTracking />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
}
