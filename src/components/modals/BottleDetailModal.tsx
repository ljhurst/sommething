'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { getWineColor } from '@/lib/wineUtils';
import { formatPrice } from '@/lib/formatUtils';
import { type WineRating, type BottleInstance } from '@/lib/types';

interface BottleDetailModalProps {
  isOpen: boolean;
  bottle: BottleInstance | null;
  onClose: () => void;
  onConsume: (bottleId: string, notes?: string, rating?: WineRating) => Promise<void>;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onEditWine?: (wineId: string) => void;
  userRole?: 'owner' | 'editor' | 'viewer';
}

export function BottleDetailModal({
  isOpen,
  bottle,
  onClose,
  onConsume,
  onNavigate,
  onEditWine,
  userRole = 'owner',
}: BottleDetailModalProps) {
  const [showConsumeForm, setShowConsumeForm] = useState(false);
  const [consumeNotes, setConsumeNotes] = useState('');
  const [consumeRating, setConsumeRating] = useState<number | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const canEdit = userRole === 'owner' || userRole === 'editor';

  if (!bottle || !bottle.wine) return null;

  const wine = bottle.wine;

  const handleConsume = async () => {
    setSubmitting(true);
    try {
      const rating =
        consumeRating !== undefined
          ? { score: consumeRating, date: new Date().toISOString() }
          : undefined;
      await onConsume(bottle.id, consumeNotes || undefined, rating);
      setConsumeNotes('');
      setConsumeRating(undefined);
      setShowConsumeForm(false);
      onClose();
    } catch (error) {
      console.error('Failed to consume bottle:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const color = getWineColor(wine.type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bottle Details" preventClose={submitting}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{wine.name}</h3>
          <p className="text-lg text-gray-600">{wine.winery}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Type</span>
          <span className="font-medium text-gray-900 capitalize">{wine.type}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Year</span>
          <span className="font-medium text-gray-900">{wine.year}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Price</span>
          <span className="font-medium text-gray-900">{formatPrice(wine.price)}</span>
        </div>
        {wine.score && (
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Score</span>
            <span className="font-medium text-gray-900">{wine.score}/100</span>
          </div>
        )}
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Slot</span>
          <span className="font-medium text-gray-900">#{bottle.slot_position}</span>
        </div>
        {bottle.added_by?.email && (
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Added by</span>
            <span className="font-medium text-gray-900">{bottle.added_by.email}</span>
          </div>
        )}
      </div>

      {wine.notes && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
          <p className="text-gray-600">{wine.notes}</p>
        </div>
      )}

      {!showConsumeForm ? (
        <div className="space-y-3">
          {canEdit && (
            <button
              onClick={() => setShowConsumeForm(true)}
              className="w-full px-4 py-3 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors font-medium"
            >
              Mark as Consumed
            </button>
          )}

          {canEdit && onEditWine && (
            <button
              onClick={() => onEditWine(wine.id)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Wine Details
            </button>
          )}

          {onNavigate && (
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('prev')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={() => onNavigate('next')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-7 hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}

          {!canEdit && (
            <p className="text-sm text-gray-500 text-center py-4">
              You have view-only access to this space
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How was it?</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConsumeRating(consumeRating === 85 ? undefined : 85)}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                  consumeRating === 85
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-500 text-gray-700'
                }`}
              >
                👍 Good
              </button>
              <button
                type="button"
                onClick={() => setConsumeRating(consumeRating === 50 ? undefined : 50)}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                  consumeRating === 50
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-red-500 text-gray-700'
                }`}
              >
                👎 Not Great
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Tasting Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={consumeNotes}
              onChange={(e) => setConsumeNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900"
              placeholder="How did it taste? What did you pair it with?"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowConsumeForm(false);
                setConsumeNotes('');
                setConsumeRating(undefined);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConsume}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Consuming...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
