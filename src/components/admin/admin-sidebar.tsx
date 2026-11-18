'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Wrench, 
  Briefcase, 
  Award, 
  UserCircle, 
  Share2,
  Settings,
  Mail, 
  ExternalLink,
  LogOut,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export const navigation = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/admin/profile', icon: UserCircle },
  { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { name: 'Skills', href: '/admin/skills', icon: Wrench },
  { name: 'Experience', href: '/admin/experience', icon: Briefcase },
  { name: 'Certificates', href: '/admin/certificates', icon: Award },
  { name: 'Social Links', href: '/admin/social-links', icon: Share2 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Messages', href: '/admin/messages', icon: Mail },
];

export function SidebarNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground">Portfolio CMS</h2>
          <span className="text-xs text-muted-foreground">Admin Workspace</span>
        </div>
        <Link 
          href="/" 
          target="_blank"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-md transition-colors"
        >
          Site <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border mt-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>{loggingOut ? 'Logging out...' : 'Sign Out'}</span>
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Don't render sidebar on login page
  if (pathname === '/admin/login') {
    return null;
  }

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border bg-card">
        <span className="font-bold text-sm">Portfolio CMS</span>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarNavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border shrink-0 flex-col min-h-screen sticky top-0 h-screen">
        <SidebarNavContent />
      </aside>
    </>
  );
}
