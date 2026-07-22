'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import apiClient from '@/lib/api-client';
import { CheckCircle2, AlertTriangle, Loader2, Mail } from 'lucide-react';
import type { ApiResponse } from '@/types/api';

export default function ConfirmSignupPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const hash = window.location.hash;
      if (!hash) {
        setStatus('error');
        setMessage('Lien de confirmation invalide. Aucun token trouvé dans l\'URL.');
        return;
      }

      try {
        const params = new URLSearchParams(hash.replace('#', ''));
        const accessToken = params.get('access_token');

        if (!accessToken) {
          setStatus('error');
          setMessage('Token de confirmation manquant. Le lien est peut-être invalide ou expiré.');
          return;
        }

        const { data } = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
          '/auth/confirm-signup',
          { accessToken },
        );

        if (data.data.success) {
          setStatus('success');
          setMessage(data.data.message);
        } else {
          setStatus('error');
          setMessage(data.data.message || 'Erreur lors de la confirmation.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(
          err?.response?.data?.message || 'Erreur lors de la confirmation de l\'email.',
        );
      }
    };

    confirmEmail();
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/5 px-3 sm:px-4">
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border bg-card p-8 sm:p-10 shadow-sm text-center">
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-3">Confirmation en cours...</h1>
              <p className="text-sm text-muted-foreground">Veuillez patienter pendant la vérification de votre lien.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
              >
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="text-xl font-bold text-foreground mb-3">Email confirmé !</h1>
              <p className="text-sm text-muted-foreground mb-8">{message}</p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Se connecter
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-3">Échec de la confirmation</h1>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Aller à la connexion
                </Link>
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Renvoyer un email de confirmation
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
