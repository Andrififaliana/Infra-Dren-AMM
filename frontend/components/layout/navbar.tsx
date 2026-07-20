'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NavbarProps {
  onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
            aria-label="Menu"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="hidden sm:inline text-sm text-slate-500">
            {isAuthenticated ? `Bienvenue, ${user?.nom?.split(' ')[0]}` : 'InfraDren AMM'}
          </span>
          <span className="sm:hidden text-xs text-slate-400 truncate max-w-[120px]">
            {user?.nom?.split(' ')[0] || ''}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/"
                className="hidden sm:inline-flex rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Site public
              </Link>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-green-700">
                {user?.role === 'ADMIN' ? 'Admin' : 'Resp.'}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-green-600 hover:bg-green-50 transition-colors"
              >
                <span className="hidden sm:inline">Déconnexion</span>
                <svg className="sm:hidden h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-green-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
