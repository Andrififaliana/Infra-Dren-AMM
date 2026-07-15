'use client';

import { useState } from 'react';
import { School } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Photo } from '@/types/etablissement';

interface EtablissementPhotoProps {
  photo?: Photo | null;
  className?: string;
  iconSize?: number;
  /** Hauteur fixe pour les cards de la liste */
  fixedHeight?: boolean;
}

/**
 * Affiche la photo d'un établissement.
 * Si aucune photo n'est disponible, affiche un placeholder gradient avec icône.
 */
export function EtablissementPhoto({
  photo,
  className,
  iconSize = 16,
  fixedHeight = false,
}: EtablissementPhotoProps) {
  const [isError, setIsError] = useState(false);

  if (!photo || isError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50',
          fixedHeight && 'h-40',
          className,
        )}
      >
        <School
          className="text-orange-300/60"
          style={{ width: iconSize, height: iconSize }}
        />
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden', fixedHeight && 'h-40', className)}>
      <img
        src={photo.url}
        alt={photo.originalName || 'Photo établissement'}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={() => setIsError(true)}
        loading="lazy"
      />
    </div>
  );
}

/**
 * Galerie de photos miniature pour la page détail.
 */
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const selected = photos[selectedIndex];

  return (
    <div className="space-y-3">
      {/* Photo principale */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        <EtablissementPhoto
          photo={selected}
          iconSize={24}
          className="aspect-[16/10] rounded-2xl"
        />
      </div>

      {/* Miniatures */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                idx === selectedIndex
                  ? 'border-orange-500 ring-1 ring-orange-500'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <img
                src={p.url}
                alt={p.originalName || `Photo ${idx + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
