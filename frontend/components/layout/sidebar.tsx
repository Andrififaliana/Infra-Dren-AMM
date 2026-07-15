'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Tableau de bord',
    href: '/dashboard/responsable/tableau-de-bord',
    icon: '📊',
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Établissements',
    href: '/dashboard/responsable/etablissements',
    icon: '🏫',
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Bâtiments',
    href: '/dashboard/responsable/batiments',
    icon: '🏗️',
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Salles',
    href: '/dashboard/responsable/salles',
    icon: '🚪',
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Équipements',
    href: '/dashboard/responsable/equipements',
    icon: '📦',
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Trajets',
    href: '/dashboard/responsable/trajets',
    icon: '🚌',
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Aléas',
    href: '/dashboard/responsable/aleas',
    icon: '🌊',
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Utilisateurs',
    href: '/dashboard/admin/utilisateurs',
    icon: '👥',
    roles: ['ADMIN'],
  },
  {
    label: 'Journal d\'audit',
    href: '/dashboard/admin/logs',
    icon: '📋',
    roles: ['ADMIN'],
  },
  {
    label: 'Sauvegarde',
    href: '/dashboard/admin/backup',
    icon: '💾',
    roles: ['ADMIN'],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin, isResponsable } = useAuthStore();

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (isAdmin) return true;
    if (isResponsable && item.roles.includes('RESPONSABLE_INFRASTRUCTURE')) return true;
    return false;
  });

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">InfraDren</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
