import { useEffect, useState } from 'react';
import { subscribeUserProfile } from '../services/habitService.js';

export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(uid));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError('');

    try {
      const unsubscribe = subscribeUserProfile(uid, (nextProfile) => {
        setProfile(nextProfile);
        setLoading(false);
      });

      return unsubscribe;
    } catch (serviceError) {
      setError(serviceError.message);
      setLoading(false);
      return undefined;
    }
  }, [uid]);

  return { profile, loading, error };
}
