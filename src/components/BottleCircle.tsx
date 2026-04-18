'use client';

import { getWineColor } from '@/lib/utils';
import type { Bottle } from '@/lib/types';

interface BottleCircleProps {
  bottle: Bottle;
  onClick: () => void;
}

export function BottleCircle({ bottle, onClick }: BottleCircleProps) {
  const color = getWineColor(bottle.type);

  return (
    <button
      onClick={onClick}
      className="relative w-full aspect-square rounded-full transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-wine-red focus:ring-offset-2"
      style={{ backgroundColor: color }}
      aria-label={`${bottle.winery} ${bottle.name}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 gap-0.5">
        <span className="text-xs font-bold text-white text-center line-clamp-1 drop-shadow-md">
          {bottle.winery}
        </span>
        <span className="text-[10px] font-medium text-white/90 text-center line-clamp-1 drop-shadow-md">
          {bottle.name}
        </span>
      </div>

      <div className="absolute top-1 right-1 bg-black/30 text-white text-[10px] px-1.5 py-0.5 rounded-full">
        {bottle.slot_position}
      </div>
    </button>
  );
}
