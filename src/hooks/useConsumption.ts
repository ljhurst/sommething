import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ConsumptionHistory, Rating } from '@/lib/types';

interface ConsumeBottleParams {
  bottleId: string;
  notes?: string;
  rating?: Rating;
}

export function useConsumption() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consumeBottle = async (params: ConsumeBottleParams): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: insertError } = await supabase.from('consumption_history').insert({
        bottle_id: params.bottleId,
        notes: params.notes,
        rating: params.rating,
        consumed_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from('bottles')
        .delete()
        .eq('id', params.bottleId);

      if (deleteError) throw deleteError;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to consume bottle');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getConsumptionHistory = async (): Promise<ConsumptionHistory[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('consumption_history')
        .select('*')
        .order('consumed_at', { ascending: false });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    consumeBottle,
    getConsumptionHistory,
  };
}
