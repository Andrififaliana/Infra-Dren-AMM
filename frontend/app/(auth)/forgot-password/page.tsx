'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useForgotPassword } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, CheckCircle2, ArrowLeft, ShieldAlert, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { mutate: sendReset, isPending, error } = useForgotPassword();
  const { theme, toggleTheme, mounted } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendReset(email, {
      onSuccess: () => setSent(true),
    });
  };

  if (sent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/5 p-4">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50 rounded-lg p-2.5 bg-background/80 backdrop-blur-sm border shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
              >
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </motion.div>

              <h2 className="text-xl font-bold mb-3">Email envoyé</h2>
              <p className="text-sm text-muted-foreground mb-2">
                Si un compte existe avec l&apos;adresse <strong className="text-foreground">{email}</strong>,
                vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
              </p>
              <p className="text-xs text-muted-foreground/70 mb-8">
                Vérifiez également vos spams. Le lien expire après 1 heure.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/5 p-4">
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      {/* Theme toggle */}
      {mounted && (
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-50 rounded-lg p-2.5 bg-background/80 backdrop-blur-sm border shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <img src="/logo_infra.jpg" alt="InfraDren AMM" className="mx-auto h-14 w-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">InfraDren AMM</h1>
          <p className="mt-1 text-muted-foreground">Réinitialisation du mot de passe</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <ShieldAlert className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Mot de passe oublié</CardTitle>
              <CardDescription>Entrez votre email pour recevoir un lien de réinitialisation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  icon={<Mail className="h-4 w-4" />}
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    {error instanceof Error ? error.message : "Erreur lors de l'envoi"}
                  </motion.div>
                )}

                <Button type="submit" loading={isPending} className="w-full">
                  Envoyer le lien de réinitialisation
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Retour à la connexion
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
