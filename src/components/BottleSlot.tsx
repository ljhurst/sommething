'use client';

import { BottleCircle } from './BottleCircle';
import { EmptySlot } from './EmptySlot';
import type { BottleInstance } from '@/lib/types';

interface BottleSlotProps {
  slotNumber: number;
  bottle?: BottleInstance;
  onBottleClick: (bottle: BottleInstance) => void;
  onEmptySlotClick: (slotNumber: number) => void;
}

export function BottleSlot({
  slotNumber,
  bottle,
  onBottleClick,
  onEmptySlotClick,
}: BottleSlotProps) {
  if (bottle) {
    return <BottleCircle bottle={bottle} onClick={() => onBottleClick(bottle)} />;
  }

  return <EmptySlot slotNumber={slotNumber} onClick={() => onEmptySlotClick(slotNumber)} />;
}
