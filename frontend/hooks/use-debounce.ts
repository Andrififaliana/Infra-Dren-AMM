'use client';

import { useState, useEffect } from 'react';

/**
 * Hook qui retourne une valeur décalée (debounced).
 * Utile pour les recherches et les inputs qui déclenchent des requêtes API.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
