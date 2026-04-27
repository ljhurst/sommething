'use client';

interface EmptySlotProps {
  slotNumber: number;
  onClick: () => void;
  isOver?: boolean;
}

export function EmptySlot({ slotNumber, onClick, isOver = false }: EmptySlotProps) {
  return (
    <div className="relative w-full">
      <div className="absolute -top-1 -right-1 z-10 w-5 h-5 flex items-center justify-center bg-white text-gray-600 text-[10px] font-semibold rounded-full shadow-sm ring-1 ring-gray-200">
        {slotNumber}
      </div>

      <button
        onClick={onClick}
        className={`w-full aspect-square rounded-full border-2 border-dashed transition-all hover:border-wine-red hover:bg-gray-100 active:scale-95 focus:outline-none focus:ring-2 focus:ring-wine-red focus:ring-offset-2 ${
          isOver
            ? 'border-wine-red bg-wine-red/10 scale-95 border-solid'
            : 'border-gray-300 bg-gray-50'
        }`}
        aria-label={`Add bottle to slot ${slotNumber}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className={`w-8 h-8 transition-colors ${isOver ? 'text-wine-red' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>
    </div>
  );
}
