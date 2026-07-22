'use client';

import { motion } from 'motion/react';
import { School } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/5">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
        >
          <School className="h-10 w-10 text-primary" />
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mx-auto h-1.5 rounded-full bg-gradient-to-r from-primary/40 to-primary"
          style={{ width: 200 }}
        />
        <p className="mt-4 text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}
