'use client';

import { getWineColor } from '@/lib/utils';
import type { BottleInstance } from '@/lib/types';

interface BottleCircleProps {
  bottle: BottleInstance;
  onClick: () => void;
}

export function BottleCircle({ bottle, onClick }: BottleCircleProps) {
  const wine = bottle.wine;
  if (!wine) return null;

  const color = getWineColor(wine.type);

  return (
    <div className="relative w-full">
      <div className="absolute -top-1 -right-1 z-10 w-5 h-5 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold rounded-full ring-1 ring-white/20">
        {bottle.slot_position}
      </div>

      <button
        onClick={onClick}
        className="w-full aspect-square rounded-full transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-wine-red focus:ring-offset-2"
        style={{ backgroundColor: color }}
        aria-label={`${wine.winery} ${wine.name}`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 gap-0.5">
          <span className="text-xs font-bold text-white text-center line-clamp-1 drop-shadow-md">
            {wine.winery}
          </span>
          <span className="text-[10px] font-medium text-white/90 text-center line-clamp-1 drop-shadow-md">
            {wine.name}
          </span>
        </div>
      </button>
    </div>
  );
}
