'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Alert } from '@/components/ui/Alert';
import { ModalActions } from '@/components/forms/ModalActions';
import { WineFormFields, WineFormData } from '@/components/forms/WineFormFields';
import { WineType } from '@/lib/types';
import type { Wine, UpdateWine } from '@/lib/types';

interface EditWineModalProps {
  isOpen: boolean;
  wine: Wine | null;
  onClose: () => void;
  onSubmit: (id: string, updates: UpdateWine) => Promise<void>;
}

export function EditWineModal({ isOpen, wine, onClose, onSubmit }: EditWineModalProps) {
  const [formData, setFormData] = useState<WineFormData>({
    winery: '',
    name: '',
    type: WineType.RED,
    year: new Date().getFullYear(),
    price: '',
    score: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wine) {
      setFormData({
        winery: wine.winery,
        name: wine.name,
        type: wine.type,
        year: wine.year,
        price: wine.price?.toString() || '',
        score: wine.score?.toString() || '',
        notes: wine.notes || '',
      });
    }
  }, [wine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!wine) return;

    if (!formData.winery.trim() || !formData.name.trim()) {
      setError('Winery and wine name are required');
      return;
    }

    if (formData.year < 1900 || formData.year > 2100) {
      setError('Please enter a valid year');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(wine.id, {
        winery: formData.winery.trim(),
        name: formData.name.trim(),
        type: formData.type,
        year: formData.year,
        price: formData.price ? parseFloat(formData.price) : undefined,
        score: formData.score ? parseInt(formData.score) : undefined,
        notes: formData.notes.trim() || undefined,
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

  if (!wine) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Wine" preventClose={isSubmitting}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <WineFormFields value={formData} onChange={setFormData} disabled={isSubmitting} />

        <ModalActions onCancel={handleClose} submitLabel="Save Changes" submitting={isSubmitting} />
      </form>
    </Modal>
  );
}
