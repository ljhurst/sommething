'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Wine } from '@/lib/types';
import { getWineColor, formatPrice } from '@/lib/utils';

interface WineCardProps {
  wine: Wine;
  onEdit: (wine: Wine) => void;
  onDelete: (wine: Wine) => void;
  getUsage: (
    wineId: string
  ) => Promise<{ bottleCount: number; consumptionCount: number; spaceCount: number }>;
}

export function WineCard({ wine, onEdit, onDelete, getUsage }: WineCardProps) {
  const { user } = useAuth();
  const [usage, setUsage] = useState({ bottleCount: 0, consumptionCount: 0, spaceCount: 0 });
  const [loadingUsage, setLoadingUsage] = useState(true);

  const isCreator = user?.id === wine.created_by_user_id;

  useEffect(() => {
    getUsage(wine.id).then((data) => {
      setUsage(data);
      setLoadingUsage(false);
    });
  }, [wine.id, getUsage]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-full flex-shrink-0"
          style={{ backgroundColor: getWineColor(wine.type) }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 truncate">{wine.name}</h3>
          <p className="text-gray-600 truncate">{wine.winery}</p>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="capitalize">{wine.type}</span>
            <span>•</span>
            <span>{wine.year}</span>
            {wine.price && (
              <>
                <span>•</span>
                <span>{formatPrice(wine.price)}</span>
              </>
            )}
            {wine.score && (
              <>
                <span>•</span>
                <span>Score: {wine.score}</span>
              </>
            )}
          </div>

          {!loadingUsage && (usage.bottleCount > 0 || usage.consumptionCount > 0) && (
            <div className="flex items-center gap-3 mt-3 text-sm">
              {usage.bottleCount > 0 && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                  {usage.bottleCount} bottle{usage.bottleCount !== 1 ? 's' : ''} in{' '}
                  {usage.spaceCount} space{usage.spaceCount !== 1 ? 's' : ''}
                </span>
              )}
              {usage.consumptionCount > 0 && (
                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                  Consumed {usage.consumptionCount}×
                </span>
              )}
            </div>
          )}

          {wine.notes && <p className="mt-3 text-sm text-gray-600 line-clamp-2">{wine.notes}</p>}
        </div>
      </div>

      {isCreator && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit(wine)}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(wine)}
            className="flex-1 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
