'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useForgotPassword } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { mutate: sendReset, isPending, error } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendReset(email, {
      onSuccess: () => {
        setSent(true);
      },
    });
  };

  if (sent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50/30 px-3 sm:px-4">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-green-100/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-10 shadow-sm text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </motion.div>

            <h1 className="text-xl font-bold text-gray-900 mb-3">Email envoyé</h1>
            <p className="text-sm text-gray-600 mb-6">
              Si un compte existe avec l&apos;adresse <strong className="text-gray-800">{email}</strong>,
              vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
            </p>
            <p className="text-xs text-gray-400 mb-8">
              Vérifiez également vos spams. Le lien de réinitialisation expire après 1 heure.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
        <div className="mb-6 sm:mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <img src="/logo_infra.png" alt="InfraDren AMM" className="mx-auto h-12 sm:h-14 w-auto mb-3 sm:mb-4" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">InfraDren AMM</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">Réinitialisation du mot de passe</p>
        </div>

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
              <h2 className="text-lg font-semibold text-gray-900">Mot de passe oublié</h2>
              <p className="text-sm text-gray-500">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              rightIcon={<Mail className="h-4 w-4 text-gray-400" />}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
              >
                {error instanceof Error ? error.message : 'Erreur lors de l\'envoi'}
              </motion.div>
            )}

            <Button type="submit" loading={isPending} className="w-full">
              {isPending ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour à la connexion
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
