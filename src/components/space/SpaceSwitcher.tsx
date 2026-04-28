'use client';

import { useState, useRef, useEffect } from 'react';
import type { Space } from '@/lib/types';
import { formatCapacity } from '@/lib/spaceUtils';
import { getSpaceTypeIcon } from '@/components/icons/space-icons';

interface SpaceSwitcherProps {
  spaces: Space[];
  currentSpaceId: string | null;
  bottleCounts: Record<string, number>;
  onSpaceChange: (spaceId: string) => void;
  onCreateNew: () => void;
}

export function SpaceSwitcher({
  spaces,
  currentSpaceId,
  bottleCounts,
  onSpaceChange,
  onCreateNew,
}: SpaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectSpace = (spaceId: string) => {
    onSpaceChange(spaceId);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    onCreateNew();
  };

  if (spaces.length === 0) {
    return null;
  }

  const currentBottleCount = currentSpace ? bottleCounts[currentSpace.id] || 0 : 0;
  const currentCapacity = currentSpace ? currentSpace.rows * currentSpace.columns : 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
      >
        {currentSpace ? getSpaceTypeIcon(currentSpace.space_type) : getSpaceTypeIcon('default')}
        <span className="hidden sm:inline text-gray-900">
          {currentSpace?.name || 'Select Space'}
        </span>
        {currentSpace && (
          <span className="text-xs text-gray-500 font-normal">
            {currentBottleCount}/{currentCapacity}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {spaces.map((space) => {
              const bottleCount = bottleCounts[space.id] || 0;
              const capacity = space.rows * space.columns;
              const isSelected = space.id === currentSpaceId;

              return (
                <button
                  key={space.id}
                  onClick={() => handleSelectSpace(space.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-gray-700 ${
                    isSelected ? 'bg-wine-red/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-shrink-0">{getSpaceTypeIcon(space.space_type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">{space.name}</span>
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-wine-red flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatCapacity(bottleCount, capacity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleCreateNew}
            className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-200 font-medium text-wine-red flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Space
          </button>
        </div>
      )}
    </div>
  );
}
