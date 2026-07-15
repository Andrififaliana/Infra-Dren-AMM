import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">InfraDren</span>
            <span className="hidden text-sm text-gray-400 sm:inline">AMM</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Accueil
            </Link>
            <Link
              href="/etablissements"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Établissements
            </Link>
            <Link
              href="/statistiques"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Statistiques
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Administration
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} InfraDren AMM - Gestion des Infrastructures Scolaires
          </p>
        </div>
      </footer>
    </div>
  );
}
