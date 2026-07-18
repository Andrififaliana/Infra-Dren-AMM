'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ImagePlus, X, Trash2, Star, StarOff, Loader2,
  ChevronLeft, ChevronRight, Download, ZoomIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';
import type { Photo } from '@/types/etablissement';

interface PhotoUploadProps {
  etablissementId: number;
  photos?: Photo[];
}

export function PhotoUpload({ etablissementId, photos = [] }: PhotoUploadProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [settingMain, setSettingMain] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sortedPhotos = [...photos].sort((a, b) => (a.estPrincipale ? -1 : 1));

  const refreshPhotos = () => {
    queryClient.invalidateQueries({ queryKey: ['etablissements', etablissementId] });
  };

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      let isFirst = true;
      for (const file of Array.from(files)) {
        formData.append(isFirst && files.length === 1 ? 'file' : 'files', file);
        isFirst = false;
      }

      const endpoint = files.length === 1
        ? `/etablissements/${etablissementId}/photos`
        : `/etablissements/${etablissementId}/photos/multiple`;

      await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploadée${files.length > 1 ? 's' : ''}`);
      refreshPhotos();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }, [etablissementId, refreshPhotos]);

  const handleSetMain = async (photoId: number) => {
    setSettingMain(photoId);
    try {
      await apiClient.patch(`/etablissements/${etablissementId}/photos/${photoId}`, {
        estPrincipale: 'true',
      });
      toast.success('Photo définie comme principale');
      refreshPhotos();
    } catch {
      toast.error("Erreur lors de la définition de la photo principale");
    } finally {
      setSettingMain(null);
    }
  };

  const handleDelete = async (photoId: number) => {
    setDeleting(photoId);
    try {
      await apiClient.delete(`/etablissements/${etablissementId}/photos/${photoId}`);
      toast.success('Photo supprimée');
      refreshPhotos();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [handleUpload]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goNext = () => setLightboxIndex((i) => i !== null ? (i + 1) % sortedPhotos.length : null);
  const goPrev = () => setLightboxIndex((i) => i !== null ? (i - 1 + sortedPhotos.length) % sortedPhotos.length : null);

  const mainPhoto = sortedPhotos.find((p) => p.estPrincipale);

  return (
    <div className="space-y-4">
      {/* Compteur de photos */}
      {sortedPhotos.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <ImagePlus className="h-4 w-4" />
            <span className="font-medium">{sortedPhotos.length} photo{sortedPhotos.length > 1 ? 's' : ''}</span>
            {mainPhoto && (
              <span className="ml-1 text-orange-500/70">
                — {mainPhoto.originalName || 'Photo principale'}
              </span>
            )}
          </div>
          {photos.length !== sortedPhotos.length && (
            <span className="text-xs text-orange-400">{photos.length} au total</span>
          )}
        </div>
      )}

      {/* Grille de photos */}
      {sortedPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {sortedPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200/50 transition-all hover:ring-2 hover:ring-orange-300"
            >
              <button
                type="button"
                onClick={() => openLightbox(idx)}
                className="block w-full"
              >
                <img
                  src={photo.url}
                  alt={photo.originalName || 'Photo'}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </button>

              {/* Badge principale + Zoom */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/30">
                <ZoomIn className="h-7 w-7 text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow-lg" />
              </div>

              {photo.estPrincipale && (
                <div className="absolute left-2 top-2 rounded-full bg-orange-500 p-1.5 shadow-lg">
                  <Star className="h-3.5 w-3.5 text-white fill-white" />
                </div>
              )}

              {/* Actions en bas */}
              <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-1.5 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2 pt-6 transition-transform group-hover:translate-y-0">
                {!photo.estPrincipale && (
                  <button
                    type="button"
                    onClick={() => handleSetMain(photo.id)}
                    disabled={settingMain === photo.id}
                    className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-orange-500/80"
                    title="Définir comme principale"
                  >
                    {settingMain === photo.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <StarOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  disabled={deleting === photo.id}
                  className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500/80"
                  title="Supprimer"
                >
                  {deleting === photo.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Nom du fichier en bas */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs text-white/90">
                  {photo.originalName || `Photo #${photo.id}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone d'upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('photo-input')?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all',
          dragOver
            ? 'scale-[1.02] border-orange-400 bg-orange-50 shadow-lg'
            : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50',
        )}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        ) : (
          <>
            <div className={cn(
              'mb-3 rounded-xl p-3 transition-all',
              dragOver ? 'bg-orange-100' : 'bg-gray-100 group-hover:bg-orange-100',
            )}>
              <ImagePlus className={cn(
                'h-6 w-6 transition-colors',
                dragOver ? 'text-orange-500' : 'text-gray-400',
              )} />
            </div>
            <p className="text-sm font-medium text-gray-600">
              {dragOver ? 'Déposez vos fichiers ici' : 'Cliquez ou déposez des photos ici'}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              JPG, PNG, WebP ou GIF — max 10 Mo par fichier
            </p>
          </>
        )}
        <input
          id="photo-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      {/* État vide */}
      {sortedPhotos.length === 0 && !uploading && (
        <p className="text-center text-sm text-gray-400">
          Aucune photo pour cet établissement
        </p>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && sortedPhotos[lightboxIndex] && (
        <LightboxModal
          photos={sortedPhotos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
        />
      )}
    </div>
  );
}

// ─── Lightbox modal ─────────────────────────────────

function LightboxModal({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const current = photos[currentIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNext, onPrev]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/70"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Compteur */}
      <span className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
        {currentIndex + 1} / {photos.length}
      </span>

      {/* Badge principale */}
      {current.estPrincipale && (
        <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1.5 text-sm text-white shadow-lg">
          <Star className="mr-1 inline-block h-3.5 w-3.5 fill-white" />
          Photo principale
        </span>
      )}

      {/* Navigation */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Image */}
      <div className="flex max-h-[85vh] max-w-[90vw] items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={current.url}
          alt={current.originalName || `Photo ${currentIndex + 1}`}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        />
      </div>

      {/* Infos */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/80">
          {current.originalName || `Photo #${current.id}`}
        </span>
        <a
          href={current.url}
          download={current.originalName || `photo-${current.id}`}
          className="rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/70"
          title="Télécharger"
        >
          <Download className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
