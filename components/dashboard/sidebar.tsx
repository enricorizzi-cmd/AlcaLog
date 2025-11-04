'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  ArrowLeftRight,
  ClipboardCheck,
  Warehouse,
  FileText,
  Settings,
  Users,
  Menu,
  X,
  LogOut,
  Boxes,
  TrendingUp,
  Building2,
  PackageSearch,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/fornitori', label: 'Fornitori', icon: Building2 },
  { href: '/dashboard/articoli', label: 'Articoli', icon: Package },
  { href: '/dashboard/ordini', label: 'Ordini', icon: ShoppingCart },
  { href: '/dashboard/ricevimento', label: 'Ricevimento', icon: Truck },
  { href: '/dashboard/prelievo', label: 'Prelievo', icon: PackageSearch },
  { href: '/dashboard/giacenze', label: 'Giacenze', icon: Boxes },
  { href: '/dashboard/magazzini', label: 'Magazzini', icon: Warehouse },
  { href: '/dashboard/trasferimenti', label: 'Trasferimenti', icon: ArrowLeftRight },
  { href: '/dashboard/inventario', label: 'Inventario', icon: ClipboardCheck },
  { href: '/dashboard/movimenti', label: 'Movimenti', icon: FileText },
  { href: '/dashboard/pianificazione', label: 'Pianificazione', icon: TrendingUp },
  { href: '/dashboard/utenti', label: 'Utenti', icon: Users },
  { href: '/dashboard/impostazioni', label: 'Impostazioni', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} onLogout={handleLogout} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn('hidden lg:flex lg:flex-col lg:w-[280px] lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 bg-white border-r border-gray-200', className)}>
        <SidebarContent pathname={pathname} onNavigate={() => {}} onLogout={handleLogout} />
      </aside>
    </>
  );
}

function SidebarContent({ pathname, onNavigate, onLogout }: { pathname: string; onNavigate: () => void; onLogout: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-3">
          <img src="/logo.svg" alt="ALCA LOG" className="h-8 w-auto" />
          <span className="text-xl font-bold text-gray-900">ALCA LOG</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Esci
        </Button>
      </div>
    </div>
  );
}

