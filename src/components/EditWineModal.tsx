'use client';

import { useState, useEffect } from 'react';
import { WineType } from '@/lib/types';
import type { Wine, UpdateWine } from '@/lib/types';

interface EditWineModalProps {
  isOpen: boolean;
  wine: Wine | null;
  onClose: () => void;
  onSubmit: (id: string, updates: UpdateWine) => Promise<void>;
}

export function EditWineModal({ isOpen, wine, onClose, onSubmit }: EditWineModalProps) {
  const [winery, setWinery] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<WineType>(WineType.RED);
  const [year, setYear] = useState(new Date().getFullYear());
  const [price, setPrice] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wine) {
      setWinery(wine.winery);
      setName(wine.name);
      setType(wine.type);
      setYear(wine.year);
      setPrice(wine.price?.toString() || '');
      setScore(wine.score?.toString() || '');
      setNotes(wine.notes || '');
    }
  }, [wine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!wine) return;

    if (!winery.trim() || !name.trim()) {
      setError('Winery and wine name are required');
      return;
    }

    if (year < 1900 || year > 2100) {
      setError('Please enter a valid year');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(wine.id, {
        winery: winery.trim(),
        name: name.trim(),
        type,
        year,
        price: price ? parseFloat(price) : undefined,
        score: score ? parseInt(score) : undefined,
        notes: notes.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update wine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !wine) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Wine</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="edit-winery" className="block text-sm font-medium text-gray-700 mb-1">
              Winery *
            </label>
            <input
              type="text"
              id="edit-winery"
              value={winery}
              onChange={(e) => setWinery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent bg-white text-gray-900"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Wine Name *
            </label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent bg-white text-gray-900"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wine Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(WineType).map((wineType) => (
                <button
                  key={wineType}
                  type="button"
                  onClick={() => setType(wineType)}
                  disabled={isSubmitting}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors capitalize ${
                    type === wineType
                      ? 'border-wine-red bg-wine-red text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  {wineType}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="edit-year" className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="number"
              id="edit-year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              min={1900}
              max={2100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent bg-white text-gray-900"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                id="edit-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent bg-white text-gray-900"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="edit-score" className="block text-sm font-medium text-gray-700 mb-1">
                Score (0-100)
              </label>
              <input
                type="number"
                id="edit-score"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent bg-white text-gray-900"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Tasting Notes
            </label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add tasting notes, pairing suggestions, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent resize-none bg-white text-gray-900"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
