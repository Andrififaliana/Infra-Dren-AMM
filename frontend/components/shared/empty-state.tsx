import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

function DefaultIllustration() {
  return (
    <svg className="h-24 w-24 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function BuildingIllustration() {
  return (
    <svg className="h-24 w-24 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function SearchIllustration() {
  return (
    <svg className="h-24 w-24 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

const ILLUSTRATIONS: Record<string, React.ReactNode> = {
  default: <DefaultIllustration />,
  building: <BuildingIllustration />,
  search: <SearchIllustration />,
};

export function EmptyState({ title, description, actionLabel, actionHref, onAction, icon }: EmptyStateProps) {
  const illustration = typeof icon === 'string' ? ILLUSTRATIONS[icon] ?? ILLUSTRATIONS.default : (icon ?? ILLUSTRATIONS.default);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 opacity-60">
        {illustration}
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">{description}</p>
      )}
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-6">
          {actionHref ? (
            <Link href={actionHref}>
              <Button>{actionLabel}</Button>
            </Link>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}
