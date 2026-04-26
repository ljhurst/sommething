'use client';

import { useState } from 'react';
import type { NewSpace } from '@/lib/types';

type CreateSpaceInput = Omit<NewSpace, 'owner_user_id'>;

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (space: CreateSpaceInput) => Promise<void>;
}

export function CreateSpaceModal({ isOpen, onClose, onSubmit }: CreateSpaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [spaceType, setSpaceType] = useState<'fridge' | 'cellar' | 'rack'>('fridge');
  const [rows, setRows] = useState(6);
  const [columns, setColumns] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capacity = rows * columns;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Space name is required');
      return;
    }

    if (rows < 1 || rows > 100) {
      setError('Rows must be between 1 and 100');
      return;
    }

    if (columns < 1 || columns > 100) {
      setError('Columns must be between 1 and 100');
      return;
    }

    if (capacity > 500) {
      setError('Maximum capacity is 500 slots. Please reduce rows or columns.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        space_type: spaceType,
        rows,
        columns,
      });
      setName('');
      setDescription('');
      setSpaceType('fridge');
      setRows(6);
      setColumns(4);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create space');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setDescription('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create New Space</h2>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Space Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kitchen Fridge, Basement Cellar"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent bg-white text-gray-900"
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this space..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent resize-none bg-white text-gray-900"
              disabled={isSubmitting}
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Space Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['fridge', 'cellar', 'rack'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSpaceType(type)}
                  disabled={isSubmitting}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors capitalize ${
                    spaceType === type
                      ? 'border-wine-red bg-wine-red text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  {type === 'fridge' && '❄️'} {type === 'cellar' && '🏛️'} {type === 'rack' && '📦'}{' '}
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="columns" className="block text-sm font-medium text-gray-700 mb-1">
                Columns (Width) *
              </label>
              <input
                type="number"
                id="columns"
                value={columns}
                onChange={(e) => setColumns(parseInt(e.target.value) || 1)}
                min={1}
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent bg-white text-gray-900"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="rows" className="block text-sm font-medium text-gray-700 mb-1">
                Rows (Height) *
              </label>
              <input
                type="number"
                id="rows"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                min={1}
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-transparent bg-white text-gray-900"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Capacity:</span> {capacity} bottles ({columns} × {rows})
            </div>
            {capacity > 500 && (
              <div className="text-xs text-red-600 mt-1">
                Warning: Large grids may impact performance
              </div>
            )}
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
              {isSubmitting ? 'Creating...' : 'Create Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
