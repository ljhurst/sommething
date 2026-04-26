import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Wine, NewWine, UpdateWine } from '@/lib/types';

export function useWines() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWines = useCallback(async (): Promise<Wine[]> => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        return [];
      }

      const { data, error: fetchError } = await supabase
        .from('wines')
        .select('*')
        .order('winery', { ascending: true });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wines');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getWine = async (id: string): Promise<Wine | null> => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('wines')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wine');
      return null;
    }
  };

  const addWine = async (wine: NewWine): Promise<Wine | null> => {
    try {
      setError(null);

      if (!user) {
        setError('You must be logged in to add wines');
        return null;
      }

      const { data, error: insertError } = await supabase
        .from('wines')
        .insert({ ...wine, created_by_user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add wine');
      return null;
    }
  };

  const updateWine = async (id: string, updates: UpdateWine): Promise<boolean> => {
    try {
      setError(null);

      const { error: updateError } = await supabase.from('wines').update(updates).eq('id', id);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update wine');
      return false;
    }
  };

  const deleteWine = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase.from('wines').delete().eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete wine');
      return false;
    }
  };

  const searchWines = async (query: string): Promise<Wine[]> => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        return [];
      }

      const { data, error: fetchError } = await supabase
        .from('wines')
        .select('*')
        .or(`winery.ilike.%${query}%,name.ilike.%${query}%`)
        .order('winery', { ascending: true });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search wines');
      return [];
    } finally {
      setLoading(false);
    }
  };

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
