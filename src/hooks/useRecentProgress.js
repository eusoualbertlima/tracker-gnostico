import { useEffect, useState } from 'react';
import { subscribeRecentDays } from '../services/habitService.js';

export function useRecentProgress(uid, amount = 7) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(Boolean(uid));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uid) {
      setDays([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError('');

    try {
      const unsubscribe = subscribeRecentDays(uid, amount, (nextDays) => {
        setDays(nextDays);
        setLoading(false);
      });

      return unsubscribe;
    } catch (serviceError) {
      setError(serviceError.message);
      setLoading(false);
      return undefined;
    }
  }, [uid, amount]);

  return { days, loading, error };
}
