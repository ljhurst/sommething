'use client';

import { BottleSlot } from './BottleSlot';
import { getBottleAtSlot } from '@/lib/utils';
import type { Bottle } from '@/lib/types';

interface WineFridgeGridProps {
  bottles: Bottle[];
  onBottleClick: (bottle: Bottle) => void;
  onEmptySlotClick: (slotNumber: number) => void;
}

export function WineFridgeGrid({ bottles, onBottleClick, onEmptySlotClick }: WineFridgeGridProps) {
  const slots = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-4 gap-3 md:gap-4 p-4">
        {slots.map((slotNumber) => {
          const bottle = getBottleAtSlot(slotNumber, bottles);
          return (
            <BottleSlot
              key={slotNumber}
              slotNumber={slotNumber}
              bottle={bottle}
              onBottleClick={onBottleClick}
              onEmptySlotClick={onEmptySlotClick}
            />
          );
        })}
      </div>
    </div>
  );
}
