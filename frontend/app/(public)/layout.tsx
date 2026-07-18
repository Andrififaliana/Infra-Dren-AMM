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
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo_infra.png" alt="InfraDren AMM" className="h-9 w-auto" />
            <span className="text-lg font-bold text-gray-900">InfraDren</span>
            <span className="hidden text-sm text-gray-400 sm:inline">AMM</span>
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
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden items-center gap-2 rounded-xl border-2 border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 hover:border-green-300 transition-all sm:inline-flex"
            >
              <Shield className="h-4 w-4" />
              Administration
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 transition-colors md:hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 bg-white md:hidden overflow-hidden"
            >
              <nav className="space-y-1 px-4 py-3">
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
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Shield className="h-5 w-5" />
                  Administration
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo_infra.png" alt="InfraDren AMM" className="h-8 w-auto" />
                <span className="font-bold text-gray-900">InfraDren</span>
              </div>
              <p className="text-sm text-gray-500">
                Plateforme de gestion et de suivi des infrastructures scolaires de la région AMM.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Liens</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/etablissements" className="hover:text-green-600 transition-colors">Établissements</Link></li>
                <li><Link href="/statistiques" className="hover:text-green-600 transition-colors">Statistiques</Link></li>
                <li><Link href="/login" className="hover:text-green-600 transition-colors">Administration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>DREN AMM</li>
                <li>contact@dren-amm.mg</li>
                <li>+261 34 12 345 67</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} InfraDren AMM. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
