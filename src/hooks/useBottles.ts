import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseOperation } from './useSupabaseQuery';
import { TABLES, ERROR_MESSAGES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errorHandling';
import type { BottleInstance, NewBottleInstance, UpdateBottleInstance } from '@/lib/types';

export function useBottles(spaceId?: string) {
  const { user } = useAuth();
  const { loading, error, setError, execute, executeWithBool } = useSupabaseOperation();
  const [bottles, setBottles] = useState<BottleInstance[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchBottles = useCallback(async () => {
    try {
      setFetchLoading(true);
      setError(null);

      if (!user || !spaceId) {
        setBottles([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from(TABLES.BOTTLES)
        .select(
          `
          *,
          wine:wines(*)
        `
        )
        .eq('space_id', spaceId)
        .order('slot_position', { ascending: true });

      if (fetchError) throw fetchError;
      setBottles(data || []);
    } catch (err) {
      setError(getErrorMessage(err, ERROR_MESSAGES.FETCH_FAILED('bottles')));
    } finally {
      setFetchLoading(false);
    }
  }, [user, spaceId, setError]);

  const addBottle = useCallback(
    async (bottle: NewBottleInstance): Promise<BottleInstance | null> => {
      if (!user) {
        setError(ERROR_MESSAGES.AUTH_REQUIRED);
        return null;
      }

      return execute(async () => {
        const { data, error: insertError } = await supabase
          .from(TABLES.BOTTLES)
          .insert(bottle)
          .select(
            `
          *,
          wine:wines(*)
        `
          )
          .single();

        if (insertError) throw insertError;

        if (data) {
          setBottles((prev) => [...prev, data].sort((a, b) => a.slot_position - b.slot_position));
        }

        return data;
      }, ERROR_MESSAGES.ADD_FAILED('bottle'));
    },
    [user, execute, setError]
  );

  const updateBottle = useCallback(
    async (id: string, updates: UpdateBottleInstance): Promise<boolean> => {
      return executeWithBool(async () => {
        const { error: updateError } = await supabase
          .from(TABLES.BOTTLES)
          .update(updates)
          .eq('id', id);

        if (updateError) throw updateError;

        setBottles((prev) =>
          prev
            .map((b) => (b.id === id ? { ...b, ...updates } : b))
            .sort((a, b) => a.slot_position - b.slot_position)
        );
      }, ERROR_MESSAGES.UPDATE_FAILED('bottle'));
    },
    [executeWithBool]
  );

  const deleteBottle = useCallback(
    async (id: string): Promise<boolean> => {
      return executeWithBool(async () => {
        const { error: deleteError } = await supabase.from(TABLES.BOTTLES).delete().eq('id', id);

        if (deleteError) throw deleteError;

        setBottles((prev) => prev.filter((b) => b.id !== id));
      }, ERROR_MESSAGES.DELETE_FAILED('bottle'));
    },
    [executeWithBool]
  );

  useEffect(() => {
    fetchBottles();
  }, [fetchBottles]);

  return {
    bottles,
    loading: fetchLoading || loading,
    error,
    addBottle,
    updateBottle,
    deleteBottle,
    refetch: fetchBottles,
  };
}
