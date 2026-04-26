import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Consumption, Rating, BottleInstance, NewConsumption } from '@/lib/types';

interface ConsumeBottleParams {
  bottle: BottleInstance;
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

      if (!params.bottle.wine_id || !params.bottle.space_id) {
        setError('Invalid bottle data');
        return false;
      }

      const consumptionData: NewConsumption = {
        wine_id: params.bottle.wine_id,
        consumed_by_user_id: user.id,
        space_id: params.bottle.space_id,
        notes: params.notes,
        rating: params.rating,
      };

      const { error: insertError } = await supabase.from('consumptions').insert(consumptionData);

      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from('bottle_instances')
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

  const getConsumptionHistory = async (spaceId?: string): Promise<Consumption[]> => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        return [];
      }

      let query = supabase
        .from('consumptions')
        .select(
          `
          *,
          wine:wines(*)
        `
        )
        .order('consumed_at', { ascending: false });

      if (spaceId) {
        query = query.eq('space_id', spaceId);
      }

      const { data, error: fetchError } = await query;

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
