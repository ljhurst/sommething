import { useState, useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import type { BottleInstance } from '@/lib/types';

const TEMP_SLOT = 9999;

interface UseDragAndDropProps {
  bottles: BottleInstance[];
  updateBottle: (id: string, updates: { slot_position: number }) => Promise<boolean>;
}

export function useDragAndDrop({ bottles, updateBottle }: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setIsDragging(false);

      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const sourceBottleId = active.id as string;
      const targetSlotNumber = parseInt(over.id as string, 10);

      const sourceBottle = bottles.find((b) => b.id === sourceBottleId);
      if (!sourceBottle) return;

      const targetBottle = bottles.find((b) => b.slot_position === targetSlotNumber);

      if (targetBottle) {
        await updateBottle(targetBottle.id, { slot_position: TEMP_SLOT });
        await updateBottle(sourceBottle.id, { slot_position: targetSlotNumber });
        await updateBottle(targetBottle.id, { slot_position: sourceBottle.slot_position });
      } else {
        await updateBottle(sourceBottle.id, { slot_position: targetSlotNumber });
      }
    },
    [bottles, updateBottle]
  );

  const handleDragCancel = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
