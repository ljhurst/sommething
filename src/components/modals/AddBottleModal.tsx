'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { ModalActions } from '@/components/forms/ModalActions';
import { WineFormFields, WineFormData } from '@/components/forms/WineFormFields';
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
  const [formData, setFormData] = useState<WineFormData>({
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Bottle - Slot ${slotNumber}`}
      preventClose={submitting}
    >
      <div className="flex gap-2 mb-4">
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

      <form onSubmit={handleSubmit} className="space-y-4">
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
                    {wine.price && <div className="text-xs text-gray-500 mt-1">${wine.price}</div>}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <WineFormFields value={formData} onChange={setFormData} disabled={submitting} />
        )}

        <ModalActions
          onCancel={onClose}
          submitLabel="Add Bottle"
          submitting={submitting}
          submitDisabled={mode === 'select' && !selectedWine}
        />
      </form>
    </Modal>
  );
}
