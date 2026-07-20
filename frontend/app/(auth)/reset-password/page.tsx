'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useResetPassword } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate: resetPassword, isPending, error } = useResetPassword();

  useEffect(() => {
    // Extraire le token du hash de l'URL (format: /reset-password#access_token=xxx)
    const hash = window.location.hash;
    if (!hash) {
      setTokenError(true);
      return;
    }

    try {
      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token');
      if (!accessToken) {
        setTokenError(true);
        return;
      }
      setToken(accessToken);
    } catch {
      setTokenError(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return;
    }

    if (!token) return;

    resetPassword(
      { accessToken: token, newPassword },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        },
      },
    );
  };

  if (tokenError) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50/30 px-3 sm:px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-10 shadow-sm text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">Lien invalide</h1>
            <p className="text-sm text-gray-600 mb-8">
              Ce lien de réinitialisation est invalide ou a expiré.
              Veuillez faire une nouvelle demande.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Nouvelle demande
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-600" />
          <p className="mt-4 text-sm text-gray-500">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50/30 px-3 sm:px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-10 shadow-sm text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </motion.div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">Mot de passe réinitialisé</h1>
            <p className="text-sm text-gray-600 mb-2">
              Votre mot de passe a été modifié avec succès.
            </p>
            <p className="text-xs text-gray-400">
              Redirection vers la page de connexion...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const passwordsMatch = newPassword === confirmPassword;
  const passwordLengthValid = newPassword.length >= 6;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50/30 px-3 sm:px-4">
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-green-100/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-2.5">
              <Shield className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Nouveau mot de passe</h2>
              <p className="text-sm text-gray-500">
                Choisissez un nouveau mot de passe sécurisé
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="newPassword"
              label="Nouveau mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
              required
              minLength={6}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <Input
              id="confirmPassword"
              label="Confirmer le mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le mot de passe"
              required
            />

            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Les mots de passe ne correspondent pas
              </p>
            )}

            {newPassword && !passwordLengthValid && (
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Le mot de passe doit contenir au moins 6 caractères
              </p>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
              >
                {error instanceof Error ? error.message : 'Erreur lors de la réinitialisation'}
              </motion.div>
            )}

            <Button
              type="submit"
              loading={isPending}
              className="w-full"
              disabled={!passwordsMatch || !passwordLengthValid}
            >
              {isPending ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
