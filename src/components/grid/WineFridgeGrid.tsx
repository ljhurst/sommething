'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { BottleSlot } from '../bottle/BottleSlot';
import { BottleCircle } from '../bottle/BottleCircle';
import { getBottleAtSlot } from '@/lib/bottleUtils';
import type { BottleInstance } from '@/lib/types';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

interface WineFridgeGridProps {
  bottles: BottleInstance[];
  onBottleClick: (bottle: BottleInstance) => void;
  onEmptySlotClick: (slotNumber: number) => void;
  onDragStart: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  isDragging: boolean;
}

export function WineFridgeGrid({
  bottles,
  onBottleClick,
  onEmptySlotClick,
  onDragStart,
  onDragEnd,
  onDragCancel,
  isDragging,
}: WineFridgeGridProps) {
  const [activeBottle, setActiveBottle] = useState<BottleInstance | null>(null);
  const slots = Array.from({ length: 24 }, (_, i) => i + 1);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const bottle = bottles.find((b) => b.id === event.active.id);
    setActiveBottle(bottle || null);
    onDragStart();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveBottle(null);
    onDragEnd(event);
  };

  const handleDragCancel = () => {
    setActiveBottle(null);
    onDragCancel();
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-4 gap-3 md:gap-4 p-4 pt-6">
          {slots.map((slotNumber) => {
            const bottle = getBottleAtSlot(slotNumber, bottles);
            return (
              <BottleSlot
                key={slotNumber}
                slotNumber={slotNumber}
                bottle={bottle}
                onBottleClick={onBottleClick}
                onEmptySlotClick={onEmptySlotClick}
                isDragging={isDragging}
              />
            );
          })}
        </div>
      </div>
      <DragOverlay>
        {activeBottle ? (
          <div className="opacity-80 scale-105">
            <BottleCircle bottle={activeBottle} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
