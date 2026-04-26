import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { ConsumptionHistory, Rating, Bottle } from '@/lib/types';

interface ConsumeBottleParams {
  bottle: Bottle;
  notes?: string;
  rating?: Rating;
}

export function useConsumption() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consumeBottle = async (params: ConsumeBottleParams): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('You must be logged in to consume bottles');
        return false;
      }

      const { error: insertError } = await supabase.from('consumption_history').insert({
        bottle_id: params.bottle.id,
        user_id: user.id,
        winery: params.bottle.winery,
        name: params.bottle.name,
        type: params.bottle.type,
        year: params.bottle.year,
        price: params.bottle.price ?? null,
        score: params.bottle.score ?? null,
        consumption_notes: params.notes ?? null,
        consumption_rating: params.rating ?? null,
        consumed_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from('bottles')
        .delete()
        .eq('id', params.bottle.id);

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

      if (!user) {
        return [];
      }

      const { data, error: fetchError } = await supabase
        .from('consumption_history')
        .select('*')
        .eq('user_id', user.id)
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
