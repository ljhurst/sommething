'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WineCard } from '@/components/wine/WineCard';
import { AddWineModal } from '@/components/modals/AddWineModal';
import { EditWineModal } from '@/components/modals/EditWineModal';
import { useAuth } from '@/contexts/AuthContext';
import { useWines } from '@/hooks/useWines';
import { WineType } from '@/lib/types';
import type { Wine, NewWine, UpdateWine } from '@/lib/types';

export default function WinesPage() {
  const { user } = useAuth();
  const { fetchWines, addWine, updateWine, deleteWine, searchWines } = useWines();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<WineType | 'all'>('all');

  const loadWines = useCallback(async () => {
    setLoading(true);
    const data = await fetchWines();
    setWines(data);
    setLoading(false);
  }, [fetchWines]);

  useEffect(() => {
    loadWines();
  }, [loadWines]);

  const handleAddWine = async (wine: Omit<NewWine, 'created_by_user_id'>) => {
    const newWine = await addWine(wine as NewWine);
    if (newWine) {
      setWines((prev) => [newWine, ...prev]);
    }
  };

  const handleEditWine = async (id: string, updates: UpdateWine) => {
    const success = await updateWine(id, updates);
    if (success) {
      setWines((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    }
  };

  const handleDeleteWine = async (wine: Wine) => {
    if (!confirm(`Delete "${wine.name}" from ${wine.winery}? This cannot be undone.`)) {
      return;
    }

    const success = await deleteWine(wine.id);
    if (success) {
      setWines((prev) => prev.filter((w) => w.id !== wine.id));
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setLoading(true);
      const results = await searchWines(query);
      setWines(results);
      setLoading(false);
    } else {
      loadWines();
    }
  };

  const getWineUsage = async (_wineId: string) => {
    return { bottleCount: 0, consumptionCount: 0, spaceCount: 0 };
  };

  const filteredWines = wines.filter((wine) => {
    if (filterType !== 'all' && wine.type !== filterType) return false;
    return true;
  });

  return (
    <PageLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Wine Library</h2>
          <p className="text-gray-600">
            {wines.length} wine{wines.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
        {user && (
          <Button onClick={() => setShowAddModal(true)} className="text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Wine
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search wines by name or winery..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent bg-white text-gray-900"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-wine-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Types
          </button>
          {Object.values(WineType).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                filterType === type
                  ? 'bg-wine-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner message="Loading wines..." />}

      {!loading && filteredWines.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {wines.length === 0 ? 'No Wines Yet' : 'No Wines Found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {wines.length === 0
              ? 'Start building your wine library by adding your first wine'
              : 'Try adjusting your search or filter'}
          </p>
          {wines.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors font-medium"
            >
              Add Your First Wine
            </button>
          )}
        </div>
      )}

      {!loading && filteredWines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWines.map((wine) => (
            <WineCard
              key={wine.id}
              wine={wine}
              onEdit={(wine) => {
                setSelectedWine(wine);
                setShowEditModal(true);
              }}
              onDelete={handleDeleteWine}
              getUsage={getWineUsage}
            />
          ))}
        </div>
      )}

      <AddWineModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddWine}
      />

      <EditWineModal
        isOpen={showEditModal}
        wine={selectedWine}
        onClose={() => {
          setShowEditModal(false);
          setSelectedWine(null);
        }}
        onSubmit={handleEditWine}
      />
    </PageLayout>
  );
}
