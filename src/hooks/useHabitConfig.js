import { useEffect, useState } from 'react';
import { subscribeHabitConfig } from '../services/habitService.js';

export function useHabitConfig(uid) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(Boolean(uid));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uid) {
      setConfig(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError('');

    try {
      const unsubscribe = subscribeHabitConfig(uid, (nextConfig) => {
        setConfig(nextConfig);
        setLoading(false);
      });

      return unsubscribe;
    } catch (serviceError) {
      setError(serviceError.message);
      setLoading(false);
      return undefined;
    }
  }, [uid]);

  return { config, loading, error };
}
