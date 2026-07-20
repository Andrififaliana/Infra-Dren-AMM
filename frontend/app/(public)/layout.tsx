'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  School,
  Home,
  BarChart3,
  Info,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const navLinks = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/etablissements', label: 'Établissements', icon: School },
  { href: '/statistiques', label: 'Statistiques', icon: BarChart3 },
  { href: '/a-propos', label: 'À propos', icon: Info },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5">
            <img src="/logo_infra.png" alt="InfraDren AMM" className="h-7 sm:h-9 w-auto" />
            <span className="text-base sm:text-lg font-bold text-slate-800">InfraDren</span>
            <span className="hidden sm:inline text-sm text-slate-300">AMM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-green-700 bg-green-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-green-600"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border-2 border-green-200 bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-green-700 hover:bg-green-50 hover:border-green-300 transition-all"
            >
              <Shield className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              <span>Administration</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 transition-colors md:hidden"
              aria-label="Menu mobile"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Full screen drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Drawer */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute left-0 right-0 top-14 z-50 border-t border-slate-200 bg-white md:hidden shadow-xl"
              >
                <nav className="space-y-0.5 px-3 py-3">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href ||
                      (link.href !== '/' && pathname.startsWith(link.href));
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-green-50 text-green-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                        {link.label}
                      </Link>
                    );
                  })}
                  <div className="my-2 border-t border-slate-100" />
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <Shield className="h-4.5 w-4.5" />
                    Administration
                  </Link>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo_infra.png" alt="InfraDren AMM" className="h-8 w-auto" />
                <span className="font-bold text-slate-800">InfraDren</span>
              </div>
              <p className="text-sm text-slate-500">
                Plateforme de gestion et de suivi des infrastructures scolaires de la région AMM.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Liens</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/etablissements" className="hover:text-green-600 transition-colors">Établissements</Link></li>
                <li><Link href="/statistiques" className="hover:text-green-600 transition-colors">Statistiques</Link></li>
                <li><Link href="/login" className="hover:text-green-600 transition-colors">Administration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>DREN AMM</li>
                <li>contact@dren-amm.mg</li>
                <li>+261 34 12 345 67</li>
              </ul>
            </div>
          </div>            <div className="mt-6 sm:mt-8 border-t border-slate-200 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-slate-400">
            &copy; {new Date().getFullYear()} InfraDren AMM. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
