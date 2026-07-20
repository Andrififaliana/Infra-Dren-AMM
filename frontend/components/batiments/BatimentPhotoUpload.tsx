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

const MAX_PHOTOS = 10;

export interface BatimentPhoto {
  id: number;
  key: string;
  url: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
  estPrincipale: boolean;
  batimentId: number;
  createdAt: string;
}

interface BatimentPhotoUploadProps {
  batimentId: number;
  photos?: BatimentPhoto[];
}

export function BatimentPhotoUpload({ batimentId, photos = [] }: BatimentPhotoUploadProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [settingMain, setSettingMain] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sortedPhotos = [...photos].sort((a, b) => (a.estPrincipale ? -1 : 1));
  const mainPhoto = sortedPhotos.find((p) => p.estPrincipale);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['batiments', batimentId] });
  };

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) { toast.error(`Limite atteinte — ${MAX_PHOTOS} photos maximum`); return; }
    if (fileArray.length > remaining) { toast.error(`Vous ne pouvez ajouter que ${remaining} photo${remaining > 1 ? 's' : ''} supplémentaire${remaining > 1 ? 's' : ''}`); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of fileArray) formData.append(fileArray.length === 1 ? 'file' : 'files', file);

      const endpoint = fileArray.length === 1
        ? `/batiments/${batimentId}/photos`
        : `/batiments/${batimentId}/photos/multiple`;

      await apiClient.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`${fileArray.length} photo${fileArray.length > 1 ? 's' : ''} uploadée${fileArray.length > 1 ? 's' : ''}`);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'upload");
    } finally { setUploading(false); }
  }, [batimentId, photos.length, refresh]);

  const handleSetMain = async (photoId: number) => {
    setSettingMain(photoId);
    try {
      await apiClient.patch(`/batiments/${batimentId}/photos/${photoId}`, { estPrincipale: 'true' });
      toast.success('Photo définie comme principale'); refresh();
    } catch { toast.error("Erreur"); }
    finally { setSettingMain(null); }
  };

  const handleDelete = async (photoId: number) => {
    setDeleting(photoId);
    try {
      await apiClient.delete(`/batiments/${batimentId}/photos/${photoId}`);
      toast.success('Photo supprimée'); refresh();
    } catch { toast.error('Erreur'); }
    finally { setDeleting(null); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const goNext = () => setLightboxIndex((i) => i !== null ? (i + 1) % sortedPhotos.length : null);
  const goPrev = () => setLightboxIndex((i) => i !== null ? (i - 1 + sortedPhotos.length) % sortedPhotos.length : null);

  return (
    <div className="space-y-4">
      {sortedPhotos.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <ImagePlus className="h-4 w-4" />
            <span className="font-medium">{sortedPhotos.length} photo{sortedPhotos.length > 1 ? 's' : ''}</span>
            {mainPhoto && <span className="ml-1 text-green-500/70">— {mainPhoto.originalName || 'Principale'}</span>}
          </div>
        </div>
      )}

      {sortedPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {sortedPhotos.map((photo, idx) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200/50 transition-all hover:ring-2 hover:ring-green-300">
              <button type="button" onClick={() => openLightbox(idx)} className="block w-full">
                <img src={photo.url} alt={photo.originalName || 'Photo'} className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </button>
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/30">
                <ZoomIn className="h-7 w-7 text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow-lg" />
              </div>
              {photo.estPrincipale && (
                <div className="absolute left-2 top-2 rounded-full bg-green-500 p-1.5 shadow-lg">
                  <Star className="h-3.5 w-3.5 text-white fill-white" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-1.5 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2 pt-6 transition-transform group-hover:translate-y-0">
                {!photo.estPrincipale && (
                  <button type="button" onClick={() => handleSetMain(photo.id)} disabled={settingMain === photo.id}
                    className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-green-500/80" title="Définir comme principale">
                    {settingMain === photo.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <StarOff className="h-3.5 w-3.5" />}
                  </button>
                )}
                <button type="button" onClick={() => handleDelete(photo.id)} disabled={deleting === photo.id}
                  className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500/80" title="Supprimer">
                  {deleting === photo.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs text-white/90">{photo.originalName || `Photo #${photo.id}`}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {(() => {
        const atLimit = sortedPhotos.length >= MAX_PHOTOS;
        return (
          <div onDragOver={(e) => { e.preventDefault(); if (!atLimit) setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={atLimit ? (e) => { e.preventDefault(); setDragOver(false); toast.error(`Limite atteinte — ${MAX_PHOTOS} photos maximum`); } : handleDrop}
            onClick={() => { if (!atLimit) document.getElementById('batiment-photo-input')?.click(); }}
            className={cn('flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all',
              atLimit ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'cursor-pointer',
              dragOver && !atLimit ? 'scale-[1.02] border-green-400 bg-green-50 shadow-lg' : !atLimit && 'border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-green-50/50')}>
            {uploading ? <Loader2 className="h-8 w-8 animate-spin text-green-500" /> : atLimit ? (
              <><div className="mb-3 rounded-xl bg-gray-200 p-3"><ImagePlus className="h-6 w-6 text-gray-400" /></div>
                <p className="text-sm font-medium text-gray-500">Limite atteinte — {MAX_PHOTOS} photos maximum</p>
                <p className="mt-1 text-xs text-gray-400">Supprimez une photo pour en ajouter une nouvelle</p></>
            ) : (
              <><div className={cn('mb-3 rounded-xl p-3 transition-all', dragOver ? 'bg-green-100' : 'bg-gray-100')}>
                <ImagePlus className={cn('h-6 w-6 transition-colors', dragOver ? 'text-green-500' : 'text-gray-400')} /></div>
                <p className="text-sm font-medium text-gray-600">{dragOver ? 'Déposez vos fichiers ici' : 'Cliquez ou déposez des photos ici'}</p>
                <p className="mt-1 text-xs text-gray-400">JPG, PNG, WebP ou GIF — max 10 Mo par fichier — {MAX_PHOTOS} max</p></>
            )}
            <input id="batiment-photo-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden"
              disabled={atLimit} onChange={(e) => e.target.files && handleUpload(e.target.files)} />
          </div>
        );
      })()}

      {sortedPhotos.length === 0 && !uploading && (
        <p className="text-center text-sm text-gray-400">Aucune photo pour ce bâtiment</p>
      )}

      {lightboxIndex !== null && sortedPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/70"><X className="h-6 w-6" /></button>
          <span className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">{lightboxIndex + 1} / {sortedPhotos.length}</span>
          {sortedPhotos[lightboxIndex].estPrincipale && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-3 py-1.5 text-sm text-white shadow-lg">
              <Star className="mr-1 inline-block h-3.5 w-3.5 fill-white" /> Photo principale
            </span>
          )}
          {sortedPhotos.length > 1 && (<>
            <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"><ChevronLeft className="h-6 w-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"><ChevronRight className="h-6 w-6" /></button>
          </>)}
          <div className="flex max-h-[85vh] max-w-[90vw] items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={sortedPhotos[lightboxIndex].url} alt={sortedPhotos[lightboxIndex].originalName || `Photo ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl" />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/80">{sortedPhotos[lightboxIndex].originalName || `Photo #${sortedPhotos[lightboxIndex].id}`}</span>
            <a href={sortedPhotos[lightboxIndex].url} download={sortedPhotos[lightboxIndex].originalName || `photo-${sortedPhotos[lightboxIndex].id}`}
              className="rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/70" title="Télécharger"><Download className="h-5 w-5" /></a>
          </div>
        </div>
      )}
    </div>
  );
}
