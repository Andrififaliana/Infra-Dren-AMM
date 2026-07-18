'use client';

import { motion } from 'motion/react';
import { School } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50/30">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100"
        >
          <School className="h-10 w-10 text-green-600" />
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mx-auto h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-600"
          style={{ width: 200 }}
        />
        <p className="mt-4 text-sm text-gray-500">Chargement...</p>
      </div>
    </div>
  );
}
