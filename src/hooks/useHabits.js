import { useEffect, useMemo, useState } from 'react';
import {
  ensureDayDocument,
  flattenHabits,
  getTodayKey,
  normalizeBlocks,
  subscribeDay,
  subscribeStreak,
} from '../services/habitService.js';

export function useHabits(uid, blocks) {
  const sortedBlocks = useMemo(() => normalizeBlocks(blocks ?? []), [blocks]);
  const totalHabits = useMemo(() => flattenHabits(sortedBlocks).length, [sortedBlocks]);
  const [day, setDay] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(Boolean(uid));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uid || !sortedBlocks.length) {
      setDay(null);
      setLoading(false);
      return undefined;
    }

    const dateKey = getTodayKey();
    let unsubscribeDay;

    setLoading(true);
    setError('');

    ensureDayDocument(uid, dateKey, sortedBlocks)
      .then(() => {
        unsubscribeDay = subscribeDay(uid, dateKey, (nextDay) => {
          setDay(nextDay);
          setLoading(false);
        });
      })
      .catch((serviceError) => {
        setError(serviceError.message);
        setLoading(false);
      });

    return () => {
      if (unsubscribeDay) {
        unsubscribeDay();
      }
    };
  }, [uid, sortedBlocks]);

  useEffect(() => {
    if (!uid) {
      setStreak(0);
      return undefined;
    }

    try {
      return subscribeStreak(uid, setStreak);
    } catch (serviceError) {
      setError(serviceError.message);
      return undefined;
    }
  }, [uid]);

  return {
    day,
    streak,
    loading,
    error,
    totalHabits,
    dateKey: getTodayKey(),
  };
}
