import { useState, useEffect } from 'react';

export function useOfflineCache<T>(key: string, initialData: T) {
  const [data, setData] = useState<T>(() => {
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cache', e);
      }
    }
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data));
  }, [key, data]);

  return [data, setData] as const;
}
