'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { WineType } from '@/lib/types';
import type { NewWine } from '@/lib/types';

interface AddWineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wine: Omit<NewWine, 'created_by_user_id'>) => Promise<void>;
}

export function AddWineModal({ isOpen, onClose, onSubmit }: AddWineModalProps) {
  const [winery, setWinery] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<WineType>(WineType.RED);
  const [year, setYear] = useState(new Date().getFullYear());
  const [price, setPrice] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      await onSubmit({
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
      setError(err instanceof Error ? err.message : 'Failed to add wine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setWinery('');
      setName('');
      setType(WineType.RED);
      setYear(new Date().getFullYear());
      setPrice('');
      setScore('');
      setNotes('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Wine" preventClose={isSubmitting}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="winery" className="block text-sm font-medium text-gray-700 mb-1">
            Winery *
          </label>
          <input
            type="text"
            id="winery"
            value={winery}
            onChange={(e) => setWinery(e.target.value)}
            placeholder="e.g., Caymus Vineyards"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent bg-white text-gray-900"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Wine Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Cabernet Sauvignon"
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
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year *
          </label>
          <input
            type="number"
            id="year"
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
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD)
            </label>
            <input
              type="number"
              id="price"
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
            <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
              Score (0-100)
            </label>
            <input
              type="number"
              id="score"
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
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Tasting Notes
          </label>
          <textarea
            id="notes"
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
            {isSubmitting ? 'Adding...' : 'Add Wine'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
