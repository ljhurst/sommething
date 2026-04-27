'use client';

import { useState, useEffect } from 'react';
import { WineType, type NewWine, type Wine } from '@/lib/types';
import { useWines } from '@/hooks/useWines';

interface AddBottleModalProps {
  isOpen: boolean;
  slotNumber: number;
  spaceId: string;
  onClose: () => void;
  onSubmit: (wineIdOrData: string | NewWine, slotPosition: number) => Promise<void>;
}

export function AddBottleModal({
  isOpen,
  slotNumber,
  spaceId: _spaceId,
  onClose,
  onSubmit,
}: AddBottleModalProps) {
  const { searchWines } = useWines();
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Wine[]>([]);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    winery: '',
    name: '',
    type: WineType.RED,
    year: new Date().getFullYear(),
    price: '',
    score: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, submitting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setMode('select');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedWine(null);
      setFormData({
        winery: '',
        name: '',
        type: WineType.RED,
        year: new Date().getFullYear(),
        price: '',
        score: '',
        notes: '',
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const results = await searchWines(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'select' && selectedWine) {
        await onSubmit(selectedWine.id, slotNumber);
      } else {
        const wine: NewWine = {
          winery: formData.winery,
          name: formData.name,
          type: formData.type,
          year: formData.year,
          price: formData.price ? parseFloat(formData.price) : undefined,
          score: formData.score ? parseInt(formData.score) : undefined,
          notes: formData.notes || undefined,
          created_by_user_id: '',
        };
        await onSubmit(wine, slotNumber);
      }

      onClose();
    } catch (error) {
      console.error('Failed to add bottle:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !submitting) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add Bottle - Slot {slotNumber}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('select')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'select'
                  ? 'bg-wine-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Select Existing
            </button>
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'create'
                  ? 'bg-wine-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Create New
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'select' ? (
            <>
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search for a wine
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900"
                  placeholder="Search by winery or wine name..."
                />
              </div>

              {isSearching && <div className="text-center py-4 text-gray-600">Searching...</div>}

              {searchQuery.trim().length < 2 && !isSearching && (
                <div className="text-center py-8 text-gray-500">
                  Type at least 2 characters to search
                </div>
              )}

              {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-3">No wines found</p>
                  <button
                    type="button"
                    onClick={() => setMode('create')}
                    className="text-wine-red hover:underline text-sm"
                  >
                    Create a new wine instead
                  </button>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((wine) => (
                    <button
                      key={wine.id}
                      type="button"
                      onClick={() => setSelectedWine(wine)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedWine?.id === wine.id
                          ? 'border-wine-red bg-wine-red/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{wine.winery}</div>
                      <div className="text-sm text-gray-600">
                        {wine.name} • {wine.year} • {wine.type}
                      </div>
                      {wine.price && (
                        <div className="text-xs text-gray-500 mt-1">${wine.price}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label htmlFor="winery" className="block text-sm font-medium text-gray-700 mb-1">
                  Winery *
                </label>
                <input
                  id="winery"
                  type="text"
                  required
                  value={formData.winery}
                  onChange={(e) => setFormData({ ...formData, winery: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900"
                  placeholder="Château Margaux"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Wine Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900"
                  placeholder="Margaux"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  id="type"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as WineType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900"
                >
                  <option value={WineType.RED}>Red</option>
                  <option value={WineType.WHITE}>White</option>
                  <option value={WineType.ROSE}>Rosé</option>
                  <option value={WineType.SPARKLING}>Sparkling</option>
                  <option value={WineType.DESSERT}>Dessert</option>
                  <option value={WineType.OTHER}>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <input
                    id="year"
                    type="number"
                    required
                    min="1900"
                    max="2100"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
                  Score (0-100)
                </label>
                <input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900"
                  placeholder="Optional tasting notes or purchase details"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (mode === 'select' && !selectedWine)}
              className="flex-1 px-4 py-2 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Bottle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
