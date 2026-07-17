'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
        <li>
          <Link
            href="/responsable/tableau-de-bord"
            className="flex items-center gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Accueil</span>
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            {item.href ? (
              <Link
                href={item.href}
                className="rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className="rounded-lg px-2 py-1 font-medium text-gray-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
