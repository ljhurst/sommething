'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { Alert } from '@/components/ui/Alert';
import { ModalActions } from '@/components/forms/ModalActions';
import { WineFormFields, WineFormData } from '@/components/forms/WineFormFields';
import { WineType } from '@/lib/types';
import type { NewWine } from '@/lib/types';

interface AddWineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wine: Omit<NewWine, 'created_by_user_id'>) => Promise<void>;
}

export function AddWineModal({ isOpen, onClose, onSubmit }: AddWineModalProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      await onSubmit({
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
      setError(err instanceof Error ? err.message : 'Failed to add wine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        winery: '',
        name: '',
        type: WineType.RED,
        year: new Date().getFullYear(),
        price: '',
        score: '',
        notes: '',
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Wine" preventClose={isSubmitting}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <WineFormFields value={formData} onChange={setFormData} disabled={isSubmitting} />

        <ModalActions onCancel={handleClose} submitLabel="Add Wine" submitting={isSubmitting} />
      </form>
    </Modal>
  );
}
