import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { BottleInstance, NewBottleInstance, UpdateBottleInstance } from '@/lib/types';

export function useBottles(spaceId?: string) {
  const { user } = useAuth();
  const [bottles, setBottles] = useState<BottleInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBottles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || !spaceId) {
        setBottles([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('bottle_instances')
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
      setError(err instanceof Error ? err.message : 'Failed to fetch bottles');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, spaceId]);

  const addBottle = async (bottle: NewBottleInstance): Promise<BottleInstance | null> => {
    try {
      if (!user) {
        setError('You must be logged in to add bottles');
        return null;
      }

      const { data, error: insertError } = await supabase
        .from('bottle_instances')
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add bottle');
      return null;
    }
  };

  const updateBottle = async (id: string, updates: UpdateBottleInstance): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('bottle_instances')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      setBottles((prev) =>
        prev
          .map((b) => (b.id === id ? { ...b, ...updates } : b))
          .sort((a, b) => a.slot_position - b.slot_position)
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bottle');
      return false;
    }
  };

  const deleteBottle = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase.from('bottle_instances').delete().eq('id', id);

      if (deleteError) throw deleteError;

      setBottles((prev) => prev.filter((b) => b.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bottle');
      return false;
    }
  };

  useEffect(() => {
    fetchBottles();
  }, [fetchBottles]);

  return {
    bottles,
    loading,
    error,
    addBottle,
    updateBottle,
    deleteBottle,
    refetch: fetchBottles,
  };
}
