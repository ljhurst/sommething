'use client';

interface EmptySlotProps {
  slotNumber: number;
  onClick: () => void;
}

export function EmptySlot({ slotNumber, onClick }: EmptySlotProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-full aspect-square rounded-full border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-wine-red hover:bg-gray-100 active:scale-95 focus:outline-none focus:ring-2 focus:ring-wine-red focus:ring-offset-2"
      aria-label={`Add bottle to slot ${slotNumber}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <div className="absolute top-1 right-1 bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">
        {slotNumber}
      </div>
    </button>
  );
}
