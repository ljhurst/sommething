import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseOperation } from './useSupabaseQuery';
import { TABLES, ERROR_MESSAGES } from '@/lib/constants';
import type { Consumption, WineRating, BottleInstance, NewConsumption } from '@/lib/types';

interface ConsumeBottleParams {
  bottle: BottleInstance;
  notes?: string;
  rating?: WineRating;
}

export function useConsumption() {
  const { user } = useAuth();
  const { loading, error, setError, execute, executeWithBool } = useSupabaseOperation();

  const consumeBottle = async (params: ConsumeBottleParams): Promise<boolean> => {
    if (!user) {
      setError(ERROR_MESSAGES.AUTH_REQUIRED);
      return false;
    }

    if (!params.bottle.wine_id || !params.bottle.space_id) {
      setError(ERROR_MESSAGES.INVALID_DATA);
      return false;
    }

    return executeWithBool(async () => {
      const consumptionData: NewConsumption = {
        wine_id: params.bottle.wine_id,
        consumed_by_user_id: user.id,
        space_id: params.bottle.space_id,
        notes: params.notes,
        rating: params.rating,
      };

      const { error: insertError } = await supabase
        .from(TABLES.CONSUMPTIONS)
        .insert(consumptionData);

      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from(TABLES.BOTTLES)
        .delete()
        .eq('id', params.bottle.id);

      if (deleteError) throw deleteError;
    }, ERROR_MESSAGES.ADD_FAILED('consumption'));
  };

  const getConsumptionHistory = async (spaceId?: string): Promise<Consumption[]> => {
    if (!user) {
      return [];
    }

    const result = await execute(async () => {
      let query = supabase
        .from(TABLES.CONSUMPTIONS)
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
    }, ERROR_MESSAGES.FETCH_FAILED('consumption history'));

    return result || [];
  };

  return {
    loading,
    error,
    consumeBottle,
    getConsumptionHistory,
  };
}
