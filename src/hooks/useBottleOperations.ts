import { useCallback } from 'react';
import { useBottles } from './useBottles';
import { useWines } from './useWines';
import type { NewWine } from '@/lib/types';

export function useBottleOperations(spaceId?: string) {
  const { bottles, loading, error, addBottle, refetch } = useBottles(spaceId);
  const { addWine } = useWines();

  const addBottleWithWine = useCallback(
    async (wineIdOrData: string | NewWine, slotPosition: number) => {
      if (!spaceId) return null;

      let wineId: string;

      if (typeof wineIdOrData === 'string') {
        wineId = wineIdOrData;
      } else {
        const createdWine = await addWine(wineIdOrData);
        if (!createdWine) return null;
        wineId = createdWine.id;
      }

      return await addBottle({
        wine_id: wineId,
        space_id: spaceId,
        slot_position: slotPosition,
      });
    },
    [spaceId, addWine, addBottle]
  );

  return {
    bottles,
    loading,
    error,
    addBottleWithWine,
    refetch,
  };
}
