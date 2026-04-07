import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { db } from '@/lib/firebase';
import { onUsersChange } from '@/lib/storage';
import { ref, onValue } from 'firebase/database';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  Users,
  ChevronDown,
  ChevronRight,
  Map,
  ChevronLeft,
  Building2,
  Library,
  Activity,
  Truck,
  Database,
  Search,
  Plus,
  AlertCircle,
  BookOpen,
  Settings,
  Info,
  Bell,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { differenceInCalendarDays } from 'date-fns';
import { Input } from '@/components/ui/input';


interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path?: string;
  label: string;
  icon: any;
  allowedRoles?: string[];
  children?: NavItem[];
}

const ALL_ROLES = ['admin', 'bac-staff', 'archiver', 'viewer'];
const ADMIN_ONLY = ['admin'];
const ADMIN_BAC = ['admin', 'bac-staff'];
const ADMIN_ARCHIVER = ['admin', 'archiver'];
const ADMIN_BAC_VIEWER = ['admin', 'bac-staff', 'viewer'];

const navSections = [
  {
    title: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/urgent-records', label: 'Urgent Records', icon: AlertCircle, allowedRoles: ADMIN_BAC_VIEWER },
      { path: '/visual-allocation', label: 'Visual Map', icon: Map, allowedRoles: ALL_ROLES },
    ],
  },
  {
    title: 'Records',
    items: [
      {
        label: 'Procurement',
        icon: FileText,
        children: [
          { path: '/procurement?tab=add', label: 'Add', icon: Plus, allowedRoles: ADMIN_BAC },
          { path: '/procurement?tab=records', label: 'Records', icon: Eye },
          { path: '/procurement?tab=tracking', label: 'Tracking', icon: Activity, allowedRoles: ADMIN_BAC_VIEWER },
        ],
      },
    ],
  },
  {
    title: 'Storage',
    items: [
      { path: '/storage', label: 'Storage', icon: Library, allowedRoles: ADMIN_ARCHIVER },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/suppliers', label: 'Suppliers', icon: Truck, allowedRoles: ADMIN_BAC },
      { path: '/divisions', label: 'Divisions', icon: Building2, allowedRoles: ADMIN_ONLY },
      { path: '/users', label: 'User Management', icon: Users, allowedRoles: ADMIN_ONLY },
      { path: '/settings', label: 'Settings', icon: Settings, allowedRoles: ALL_ROLES },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Detect if a path is "active" given the current URL
function isPathActive(itemPath: string | undefined, currentPath: string, currentSearch: string): boolean {
  if (!itemPath) return false;
  const [p, q] = itemPath.split('?');
  if (p !== currentPath) return false;
  if (!q) return true; // no query constraint
  // Check each query param
  const itemParams = new URLSearchParams(q);
  const currentParams = new URLSearchParams(currentSearch);
  for (const [k, v] of itemParams.entries()) {
    if (currentParams.get(k) !== v) return false;
  }
  return true;
}

// ─── NavContent──────────────────────────────────────────────────────────────
interface NavContentProps {
  user: any;
  dbSize: number;
  isCollapsed: boolean;
  isOnline: boolean;
  openDropdowns: string[];
  urgentCount: number;
  currentPath: string;
  currentSearch: string;
  onToggleDropdown: (label: string) => void;
  onSetMobileOpen: (open: boolean) => void;
  onLogout: () => void;
}

const NavContent = memo(({
  user,
  dbSize,
  isCollapsed,
  isOnline,
  openDropdowns,
  urgentCount,
  currentPath,
  currentSearch,
  onToggleDropdown,
  onSetMobileOpen,
  onLogout,
}: NavContentProps) => {
  const usedStorageMB = dbSize / (1024 * 1024);
  const maxStorageMB = 1024;
  const storagePercent = Math.min((usedStorageMB / maxStorageMB) * 100, 100);

  const isRoleAllowed = (allowedRoles?: string[]) => {
    if (!allowedRoles) return true;
    return allowedRoles.includes(user?.role || '');
  };

  const renderItem = (item: NavItem) => {
    if (!isRoleAllowed(item.allowedRoles)) return null;

    const Icon = item.icon;
    const isActive = isPathActive(item.path, currentPath, currentSearch);
    const showBadge = item.label === 'Urgent Records' && urgentCount > 0;

    // Dropdown group
    if (item.children) {
      const visibleChildren = item.children.filter(c => isRoleAllowed(c.allowedRoles));
      if (visibleChildren.length === 0) return null;

      const isOpen = openDropdowns.includes(item.label) && !isCollapsed;
      const hasActiveChild = visibleChildren.some(c => isPathActive(c.path, currentPath, currentSearch));

      return (
        <Collapsible key={item.label} open={isOpen} onOpenChange={() => onToggleDropdown(item.label)}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                'flex w-full items-center justify-between gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                hasActiveChild
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && (isOpen
                ? <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                : <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-5 space-y-0.5 mt-0.5">
            {visibleChildren.map(child => {
              const ChildIcon = child.icon;
              const isChildActive = isPathActive(child.path, currentPath, currentSearch);
              const [childPath, childQuery] = (child.path || '').split('?');
              return (
                <Link
                  key={child.path}
                  to={child.path!}
                  onClick={() => onSetMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150',
                    isChildActive
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                  {child.label}
                </Link>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    // Leaf link
    return (
      <TooltipProvider key={item.path} delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={item.path!}
              onClick={() => onSetMobileOpen(false)}
              className={cn(
                'relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="flex-1">{item.label}</span>}
              {!isCollapsed && showBadge && (
                <span className="sidebar-badge">{urgentCount > 99 ? '99+' : urgentCount}</span>
              )}
              {isCollapsed && showBadge && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" />
              )}
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="text-xs z-50">
              {item.label}{showBadge ? ` (${urgentCount})` : ''}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 border-b border-border px-4 py-4 h-16', isCollapsed && 'justify-center')}>
        <img src="/logo.png" alt="Logo" className="h-7 w-7 shrink-0" />
        {!isCollapsed && <span className="text-base font-semibold text-foreground truncate tracking-tight">ProcureFlow</span>}
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-4 p-3 overflow-y-auto overflow-x-hidden">
        {navSections.map((section, idx) => {
          const hasVisible = section.items.some(item =>
            !item.allowedRoles || item.allowedRoles.includes(user?.role || '') ||
            (item as any).children?.some((c: NavItem) => !c.allowedRoles || c.allowedRoles.includes(user?.role || ''))
          );
          if (!hasVisible) return null;

          return (
            <div key={idx} className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                  {section.title}
                </div>
              )}
              {section.items.map(item => renderItem(item))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        {!isCollapsed && (
          <>
            {/* Storage usage */}
            <div className="px-2 pb-3 mb-3 border-b border-border/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Database className="w-3 h-3" />
                  DB Usage
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {storagePercent.toFixed(1)}%
                </span>
              </div>
              <Progress value={storagePercent} className="h-1 bg-muted" />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/60">
                <span>{formatBytes(dbSize)}</span>
                <span>1 GB</span>
              </div>
            </div>

            {/* User */}
            <div className="px-2 mb-3">
              <p className="text-sm font-medium text-foreground truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn('h-1.5 w-1.5 rounded-full', isOnline ? 'bg-emerald-500' : 'bg-red-500')} />
                <p className="text-[10px] text-muted-foreground capitalize">{user?.role?.replace('-', ' ')}</p>
              </div>
            </div>
          </>
        )}

        {/* Logout */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onLogout}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150',
                  isCollapsed && 'justify-center'
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!isCollapsed && 'Logout'}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="text-xs z-50">Logout</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
});

NavContent.displayName = 'NavContent';

// ═══════════════════════════════════════════════════════════════════════════════
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { dbSize, procurements } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>(['Procurement']);
  const [isOnline, setIsOnline] = useState(true);
  const [processFlowOpen, setProcessFlowOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const isFirstMount = React.useRef(true);

  // Urgent badge count
  const urgentCount = React.useMemo(() => procurements.filter(p => {
    if (!p.deadline) return false;
    try { return differenceInCalendarDays(new Date(p.deadline), new Date()) <= 10; }
    catch { return false; }
  }).length, [procurements]);

  // Force-delete / deactivate watcher
  useEffect(() => {
    if (!user) return;
    const unsub = onUsersChange(users => {
      const current = users.find(u => u.id === user.id);
      if (!current) {
        setForceDeleteOpen(true);
      } else if (current.status !== 'active') {
        logout();
        toast.error('Your account has been deactivated by an administrator.');
        navigate('/login');
      }
    });
    return () => unsub();
  }, [user, logout, navigate]);

  // Network status
  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const updateStatus = (connected: boolean) => {
      setIsOnline(prev => {
        if (prev === connected) return prev;
        if (!isFirstMount.current) {
          connected ? toast.success('Network connection restored') : toast.error('Network connection lost');
        }
        return connected;
      });
      if (isFirstMount.current) isFirstMount.current = false;
    };
    const unsub = onValue(connectedRef, snap => updateStatus(!!snap.val()));
    const handleOffline = () => updateStatus(false);
    window.addEventListener('offline', handleOffline);
    return () => { unsub(); window.removeEventListener('offline', handleOffline); };
  }, []);

  const handleLogout = useCallback(() => {
    logout(); navigate('/login');
  }, [logout, navigate]);

  const handleToggleDropdown = useCallback((label: string) => {
    setIsCollapsed(prev => {
      if (prev) {
        setOpenDropdowns([label]);
        return false;
      }
      return prev;
    });
    setOpenDropdowns(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  }, []);

  const handleSetMobileOpen = useCallback((open: boolean) => setMobileOpen(open), []);

  const navProps: NavContentProps = {
    user,
    dbSize,
    isCollapsed,
    isOnline,
    openDropdowns,
    urgentCount,
    currentPath: location.pathname,
    currentSearch: location.search,
    onToggleDropdown: handleToggleDropdown,
    onSetMobileOpen: handleSetMobileOpen,
    onLogout: handleLogout,
  };

  // Quick actions for navbar
  const quickActions = [
    { label: 'Add Record', icon: Plus, path: '/procurement?tab=add', roles: ['admin', 'bac-staff'] },
    { label: 'Records', icon: Eye, path: '/procurement?tab=records', roles: null },
    { label: 'Visual Map', icon: Map, path: '/visual-allocation', roles: null },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Force-delete dialog */}
      <AlertDialog open={forceDeleteOpen} onOpenChange={setForceDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Account Deleted</AlertDialogTitle>
            <AlertDialogDescription>
              Your account has been <strong>force deleted</strong> by the administrator. You will be logged out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => { setForceDeleteOpen(false); logout(); navigate('/login'); }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Process Flow Modal */}
      <Dialog open={processFlowOpen} onOpenChange={setProcessFlowOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Process Flow Guide
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground space-y-2">
            <p>Refer to the Process Flow page for detailed procurement workflow steps.</p>
            <Button
              variant="outline"
              onClick={() => { setProcessFlowOpen(false); navigate('/process-flow'); }}
              className="mt-2"
            >
              Open Full Guide
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden border-r border-border bg-card lg:flex flex-col h-screen sticky top-0 transition-all duration-200 z-20',
        isCollapsed ? 'w-[52px]' : 'w-56'
      )}>
        <NavContent {...navProps} />
        <button
          onClick={() => setIsCollapsed(p => !p)}
          className="absolute -right-3 top-[72px] bg-card border border-border rounded-full p-1 shadow-sm hover:bg-accent transition-colors z-30"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sticky top-0 z-10 gap-3">
          {/* Left: mobile hamburger + logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-56 p-0 bg-card border-r border-border text-foreground">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <NavContent {...navProps} />
              </SheetContent>
            </Sheet>
            <span className="font-semibold text-sm text-foreground">ProcureFlow</span>
          </div>

          {/* Desktop quick search */}
          <div className="hidden lg:flex flex-1 max-w-xs relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={navSearch}
              onChange={e => setNavSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && navSearch.trim()) {
                  navigate(`/procurement?tab=records&search=${encodeURIComponent(navSearch.trim())}`);
                  setNavSearch('');
                }
              }}
              className="pl-8 h-8 text-xs bg-background border-border focus-visible:ring-1"
            />
          </div>

          {/* Center: Quick actions (desktop) */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 justify-start lg:justify-center">
            {quickActions.map(action => {
              if (action.roles && !action.roles.includes(user?.role || '')) return null;
              const Icon = action.icon;
              return (
                <Button
                  key={action.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(action.path)}
                  className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {action.label}
                </Button>
              );
            })}
          </div>

          {/* Right: utility icons */}
          <div className="flex items-center gap-1">
            {/* Process Flow Info */}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground relative"
                    onClick={() => navigate('/urgent-records')}
                  >
                    <Bell className="h-4 w-4" />
                    {urgentCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 sidebar-badge text-[9px] min-w-[16px] h-4 flex items-center justify-center">
                        {urgentCount > 9 ? '9+' : urgentCount}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Urgent Records</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setProcessFlowOpen(true)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Process Flow Guide</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* User avatar */}
            <div className="ml-1 flex items-center gap-2 pl-2 border-l border-border">
              <div className="h-7 w-7 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-semibold text-foreground">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-medium text-foreground leading-none">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize leading-none mt-0.5">{user?.role?.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;