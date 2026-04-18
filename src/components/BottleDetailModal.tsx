'use client';

import { useState, useEffect } from 'react';
import { formatPrice, getWineColor } from '@/lib/utils';
import { Rating, type Bottle } from '@/lib/types';

interface BottleDetailModalProps {
  isOpen: boolean;
  bottle: Bottle | null;
  onClose: () => void;
  onConsume: (bottleId: string, notes?: string, rating?: Rating) => Promise<void>;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function BottleDetailModal({
  isOpen,
  bottle,
  onClose,
  onConsume,
  onNavigate,
}: BottleDetailModalProps) {
  const [showConsumeForm, setShowConsumeForm] = useState(false);
  const [consumeNotes, setConsumeNotes] = useState('');
  const [consumeRating, setConsumeRating] = useState<Rating | undefined>();
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

  if (!isOpen || !bottle) return null;

  const handleConsume = async () => {
    setSubmitting(true);
    try {
      await onConsume(bottle.id, consumeNotes || undefined, consumeRating);
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

  const color = getWineColor(bottle.type);

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
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Bottle Details</h2>
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

        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-20 h-20 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{bottle.name}</h3>
              <p className="text-lg text-gray-600">{bottle.winery}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Type</span>
              <span className="font-medium text-gray-900 capitalize">{bottle.type}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Year</span>
              <span className="font-medium text-gray-900">{bottle.year}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Price</span>
              <span className="font-medium text-gray-900">{formatPrice(bottle.price)}</span>
            </div>
            {bottle.score && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Score</span>
                <span className="font-medium text-gray-900">{bottle.score}/100</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Slot</span>
              <span className="font-medium text-gray-900">#{bottle.slot_position}</span>
            </div>
          </div>

          {bottle.notes && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-gray-600">{bottle.notes}</p>
            </div>
          )}

          {!showConsumeForm ? (
            <div className="space-y-3">
              <button
                onClick={() => setShowConsumeForm(true)}
                className="w-full px-4 py-3 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors font-medium"
              >
                Mark as Consumed
              </button>

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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How was it?</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setConsumeRating(
                        consumeRating === Rating.THUMBS_UP ? undefined : Rating.THUMBS_UP
                      )
                    }
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                      consumeRating === Rating.THUMBS_UP
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-500 text-gray-700'
                    }`}
                  >
                    👍 Good
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConsumeRating(
                        consumeRating === Rating.THUMBS_DOWN ? undefined : Rating.THUMBS_DOWN
                      )
                    }
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                      consumeRating === Rating.THUMBS_DOWN
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
        </div>
      </div>
    </div>
  );
}
