import React, { Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Archive, FolderOpen, Package } from 'lucide-react';
import Shelves from './Shelves';
import Cabinets from './Cabinets';
import Folders from './Folders';
import Boxes from './Boxes';
import { useAuth } from '@/contexts/AuthContext';

const tabs = [
    { value: 'drawers', label: 'Drawers', icon: Layers, component: Shelves },
    { value: 'cabinets', label: 'Cabinets', icon: Archive, component: Cabinets },
    { value: 'folders', label: 'Folders', icon: FolderOpen, component: Folders },
    { value: 'boxes', label: 'Boxes', icon: Package, component: Boxes },
];

export default function StorageHub() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const activeTab = searchParams.get('tab') || 'drawers';

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    const canAccess = ['admin', 'archiver'].includes(user?.role || '');

    if (!canAccess) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                You do not have permission to access Storage management.
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div>
                <h1 className="text-xl font-semibold text-foreground">Storage</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage your physical storage hierarchy — Drawers, Cabinets, Folders, and Boxes.</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="h-9 rounded-md border border-border bg-muted/50 p-0.5">
                    {tabs.map(tab => {
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

                {tabs.map(tab => {
                    const Component = tab.component;
                    return (
                        <TabsContent key={tab.value} value={tab.value} className="mt-0">
                            <Suspense fallback={<div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
                                <Component />
                            </Suspense>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}
