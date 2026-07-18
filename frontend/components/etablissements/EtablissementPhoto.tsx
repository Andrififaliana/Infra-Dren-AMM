'use client';

import { useState, useEffect, useCallback } from 'react';
import { School, X, ChevronLeft, ChevronRight, Download, ZoomIn } from 'lucide-react';
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
          'flex items-center justify-center bg-gradient-to-br from-green-100 to-green-50',
          fixedHeight && 'h-40',
          className,
        )}
      >
        <School
          className="text-green-300/60"
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
 * Lightbox plein écran pour visualiser une photo.
 */
function Lightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const current = photos[index];

  const goNext = useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length]);
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/70"
      >
        <X className="h-6 w-6" />
      </button>

      <span className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
        {index + 1} / {photos.length}
      </span>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="flex max-h-[85vh] max-w-[90vw] items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={current.url}
          alt={current.originalName || `Photo ${index + 1}`}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        />
      </div>

      <a
        href={current.url}
        download={current.originalName || `photo-${current.id}`}
        className="absolute bottom-4 right-4 rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/70"
        title="Télécharger"
      >
        <Download className="h-5 w-5" />
      </a>
    </div>
  );
}

/**
 * Galerie de photos miniature pour la page détail.
 */
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!photos || photos.length === 0) return null;

  const selected = photos[selectedIndex];

  return (
    <>
      <div className="space-y-3">
        {/* Photo principale */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="group relative w-full overflow-hidden rounded-2xl bg-gray-100 text-left"
        >
          <EtablissementPhoto
            photo={selected}
            iconSize={24}
            className="aspect-[16/10] rounded-2xl"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </button>

        {/* Miniatures */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => { setSelectedIndex(idx); setLightboxOpen(true); }}
                className={cn(
                  'relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                  idx === selectedIndex
                    ? 'border-green-500 ring-1 ring-green-500'
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

      {/* Lightbox */}
      {lightboxOpen && selected && (
        <Lightbox
          photos={photos}
          initialIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
