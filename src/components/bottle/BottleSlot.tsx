'use client';

import { useDroppable, useDraggable } from '@dnd-kit/core';
import { BottleCircle } from './BottleCircle';
import { EmptySlot } from './EmptySlot';
import type { BottleInstance } from '@/lib/types';

interface BottleSlotProps {
  slotNumber: number;
  bottle?: BottleInstance;
  onBottleClick: (bottle: BottleInstance) => void;
  onEmptySlotClick: (slotNumber: number) => void;
  isDragging: boolean;
}

export function BottleSlot({
  slotNumber,
  bottle,
  onBottleClick,
  onEmptySlotClick,
  isDragging,
}: BottleSlotProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: slotNumber.toString(),
  });

  const {
    setNodeRef: setDraggableRef,
    attributes,
    listeners,
    isDragging: isThisBottleDragging,
  } = useDraggable({
    id: bottle?.id || '',
    disabled: !bottle,
  });

  if (bottle) {
    return (
      <div ref={setDroppableRef}>
        <div
          ref={setDraggableRef}
          {...attributes}
          {...listeners}
          className={isThisBottleDragging ? 'opacity-30' : ''}
        >
          <BottleCircle
            bottle={bottle}
            onClick={() => !isDragging && onBottleClick(bottle)}
            isOver={isOver}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={setDroppableRef}>
      <EmptySlot
        slotNumber={slotNumber}
        onClick={() => onEmptySlotClick(slotNumber)}
        isOver={isOver}
      />
    </div>
  );
}
