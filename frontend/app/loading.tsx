'use client';

import { motion } from 'motion/react';
import { School } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100"
        >
          <School className="h-10 w-10 text-orange-600" />
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mx-auto h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
          style={{ width: 200 }}
        />
        <p className="mt-4 text-sm text-gray-500">Chargement...</p>
      </div>
    </div>
  );
}
