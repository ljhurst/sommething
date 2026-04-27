import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseOperation } from './useSupabaseQuery';
import { TABLES, ERROR_MESSAGES } from '@/lib/constants';
import type { Wine, NewWine, UpdateWine } from '@/lib/types';

export function useWines() {
  const { user } = useAuth();
  const { loading, error, setError, execute, executeWithBool } = useSupabaseOperation();

  const fetchWines = useCallback(async (): Promise<Wine[]> => {
    if (!user) {
      return [];
    }

    const result = await execute(async () => {
      const { data, error: fetchError } = await supabase
        .from(TABLES.WINES)
        .select('*')
        .order('winery', { ascending: true });

      if (fetchError) throw fetchError;
      return data || [];
    }, ERROR_MESSAGES.FETCH_FAILED('wines'));

    return result || [];
  }, [user, execute]);

  const getWine = useCallback(
    async (id: string): Promise<Wine | null> => {
      return execute(async () => {
        const { data, error: fetchError } = await supabase
          .from(TABLES.WINES)
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        return data;
      }, ERROR_MESSAGES.FETCH_FAILED('wine'));
    },
    [execute]
  );

  const addWine = useCallback(
    async (wine: NewWine): Promise<Wine | null> => {
      if (!user) {
        setError(ERROR_MESSAGES.AUTH_REQUIRED);
        return null;
      }

      return execute(async () => {
        const { data, error: insertError } = await supabase
          .from(TABLES.WINES)
          .insert({ ...wine, created_by_user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        return data;
      }, ERROR_MESSAGES.ADD_FAILED('wine'));
    },
    [user, execute, setError]
  );

  const updateWine = useCallback(
    async (id: string, updates: UpdateWine): Promise<boolean> => {
      return executeWithBool(async () => {
        const { error: updateError } = await supabase
          .from(TABLES.WINES)
          .update(updates)
          .eq('id', id);

        if (updateError) throw updateError;
      }, ERROR_MESSAGES.UPDATE_FAILED('wine'));
    },
    [executeWithBool]
  );

  const deleteWine = useCallback(
    async (id: string): Promise<boolean> => {
      return executeWithBool(async () => {
        const { error: deleteError } = await supabase.from(TABLES.WINES).delete().eq('id', id);

        if (deleteError) throw deleteError;
      }, ERROR_MESSAGES.DELETE_FAILED('wine'));
    },
    [executeWithBool]
  );

  const searchWines = useCallback(
    async (query: string): Promise<Wine[]> => {
      if (!user) {
        return [];
      }

      const result = await execute(async () => {
        const { data, error: fetchError } = await supabase
          .from(TABLES.WINES)
          .select('*')
          .or(`winery.ilike.%${query}%,name.ilike.%${query}%`)
          .order('winery', { ascending: true });

        if (fetchError) throw fetchError;
        return data || [];
      }, ERROR_MESSAGES.SEARCH_FAILED('wines'));

      return result || [];
    },
    [user, execute]
  );

  return {
    loading,
    error,
    fetchWines,
    getWine,
    addWine,
    updateWine,
    deleteWine,
    searchWines,
  };
}
