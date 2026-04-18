import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Bottle, NewBottle, UpdateBottle } from '@/lib/types';

export function useBottles() {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBottles = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bottles')
        .select('*')
        .order('slot_position', { ascending: true });

      if (fetchError) throw fetchError;
      setBottles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bottles');
    } finally {
      setLoading(false);
    }
  };

  const addBottle = async (bottle: NewBottle): Promise<Bottle | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('bottles')
        .insert(bottle)
        .select()
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

  const updateBottle = async (id: string, updates: UpdateBottle): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase.from('bottles').update(updates).eq('id', id);

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
      const { error: deleteError } = await supabase.from('bottles').delete().eq('id', id);

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
  }, []);

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
