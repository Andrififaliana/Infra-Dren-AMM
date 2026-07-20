'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { motion, AnimatePresence } from 'motion/react';
import { X, LayoutDashboard, School, Building2, DoorOpen, Package, Bus, Waves, Users, ClipboardList, Save, User, Map as MapIcon, Bot } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Tableau de bord',
    href: '/responsable/tableau-de-bord',
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Carte',
    href: '/responsable/carte',
    icon: <MapIcon className="h-5 w-5" />,
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Assistant IA',
    href: '/responsable/chat-ia',
    icon: <Bot className="h-5 w-5" />,
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Établissements',
    href: '/responsable/etablissements',
    icon: <School className="h-5 w-5" />,
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Bâtiments',
    href: '/responsable/batiments',
    icon: <Building2 className="h-5 w-5" />,
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Salles',
    href: '/responsable/salles',
    icon: <DoorOpen className="h-5 w-5" />,
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Équipements',
    href: '/responsable/equipements',
    icon: <Package className="h-5 w-5" />,
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Trajets',
    href: '/responsable/trajets',
    icon: <Bus className="h-5 w-5" />,
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Aléas',
    href: '/responsable/aleas',
    icon: <Waves className="h-5 w-5" />,
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
  {
    label: 'Utilisateurs',
    href: '/admin/utilisateurs',
    icon: <Users className="h-5 w-5" />,
    roles: ['ADMIN'],
  },
  {
    label: 'Journal d\'audit',
    href: '/admin/logs',
    icon: <ClipboardList className="h-5 w-5" />,
    roles: ['ADMIN'],
  },
  {
    label: 'Sauvegarde',
    href: '/admin/backup',
    icon: <Save className="h-5 w-5" />,
    roles: ['ADMIN'],
  },
  {
    label: 'Profil',
    href: '/responsable/profil',
    icon: <User className="h-5 w-5" />,
    roles: ['ADMIN', 'RESPONSABLE_INFRASTRUCTURE'],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin, isResponsable } = useAuthStore();

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (isAdmin) return true;
    if (isResponsable && item.roles.includes('RESPONSABLE_INFRASTRUCTURE')) return true;
    return false;
  });

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:block lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:h-screen lg:bg-white lg:border-r lg:border-slate-200 lg:transition-all lg:duration-300',
          collapsed ? 'lg:w-16' : 'lg:w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-700">InfraDren</span>
            </Link>
          )}
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
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
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile sidebar - Drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-screen w-72 bg-white border-r border-slate-200 shadow-2xl lg:hidden"
            >
              <div className="flex h-14 items-center justify-between px-4 border-b border-slate-200">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-700">InfraDren</span>
                </Link>
                <button
                  onClick={onMobileClose}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-green-50 text-green-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
