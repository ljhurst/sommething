'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Alert } from '@/components/ui/Alert';
import { ModalActions } from '@/components/forms/ModalActions';
import type { NewSpace, Space } from '@/lib/types';
import { getSpaceTypeIcon } from '@/components/icons/space-icons';

type CreateSpaceInput = Omit<NewSpace, 'owner_user_id'>;

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (space: CreateSpaceInput) => Promise<void>;
  initialData?: Space;
}

export function CreateSpaceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CreateSpaceModalProps) {
  const isEditing = !!initialData;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [spaceType, setSpaceType] = useState<'fridge' | 'cellar' | 'rack'>('fridge');
  const [rows, setRows] = useState(6);
  const [columns, setColumns] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setSpaceType(initialData.space_type as 'fridge' | 'cellar' | 'rack');
      setRows(initialData.rows);
      setColumns(initialData.columns);
    }
  }, [initialData]);

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
      if (!isEditing) {
        setName('');
        setDescription('');
        setSpaceType('fridge');
        setRows(6);
        setColumns(4);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} space`
      );
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Space' : 'Create New Space'}
      preventClose={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

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
                className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors capitalize flex items-center gap-2 ${
                  spaceType === type
                    ? 'border-wine-red bg-wine-red text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {getSpaceTypeIcon(type, 'w-4 h-4')}
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

        <ModalActions
          onCancel={handleClose}
          submitLabel={isEditing ? 'Update Space' : 'Create Space'}
          submitting={isSubmitting}
        />
      </form>
    </Modal>
  );
}
