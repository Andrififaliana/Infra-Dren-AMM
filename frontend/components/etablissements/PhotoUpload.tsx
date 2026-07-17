'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ImagePlus, X, Trash2, Star, Loader2 } from 'lucide-react';
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
  const [dragOver, setDragOver] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('photo-input')?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all',
          dragOver
            ? 'border-orange-400 bg-orange-50'
            : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50',
        )}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        ) : (
          <>
            <ImagePlus className="mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">
              Cliquez ou déposez des photos ici
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

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-xl bg-gray-100"
            >
              <img
                src={photo.url}
                alt={photo.originalName || 'Photo'}
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {photo.estPrincipale && (
                <div className="absolute left-2 top-2 rounded-full bg-orange-500 p-1.5">
                  <Star className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  disabled={deleting === photo.id}
                  className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                >
                  {deleting === photo.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="truncate text-xs text-white/90">
                  {photo.originalName || `Photo #${photo.id}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && !uploading && (
        <p className="text-center text-sm text-gray-400">
          Aucune photo pour cet établissement
        </p>
      )}
    </div>
  );
}
