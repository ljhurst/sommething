'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { Alert } from '@/components/ui/Alert';
import { ModalActions } from '@/components/forms/ModalActions';
import { WineFormFields } from '@/components/forms/WineFormFields';
import { LabelScanner } from '@/components/wine/LabelScanner';
import { mapLabelToWineForm, summarizeLabelDetails } from '@/lib/dio/mapToWineForm';
import { useWines } from '@/hooks/useWines';
import { WineType } from '@/lib/types';
import type { NewWine, Wine, WineFormData } from '@/lib/types';
import type { DioExtractResponse } from '@/lib/dio/types';

interface AddWineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wine: Omit<NewWine, 'created_by_user_id'>) => Promise<void>;
}

export function AddWineModal({ isOpen, onClose, onSubmit }: AddWineModalProps) {
  const { searchWines } = useWines();
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
  const [possibleDuplicates, setPossibleDuplicates] = useState<Wine[]>([]);
  const [priceSuggestion, setPriceSuggestion] = useState<number | null>(null);

  const handleExtracted = async (response: DioExtractResponse) => {
    setFormData((prev) => ({
      ...prev,
      ...mapLabelToWineForm(response.label, new Date().getFullYear()),
      notes: summarizeLabelDetails(response.label),
    }));
    setPriceSuggestion(response.enrichment.matched ? (response.enrichment.price ?? null) : null);

    const query = `${response.label.producer ?? ''} ${response.label.wine_name ?? ''}`.trim();
    if (query) {
      const matches = await searchWines(query);
      setPossibleDuplicates(matches);
    }
  };

  const handleUseSuggestedPrice = () => {
    if (priceSuggestion != null) {
      setFormData((prev) => ({ ...prev, price: String(priceSuggestion) }));
      setPriceSuggestion(null);
    }
  };

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
      setPossibleDuplicates([]);
      setPriceSuggestion(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Wine" preventClose={isSubmitting}>
      <div className="mb-4">
        <LabelScanner onExtracted={handleExtracted} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        {possibleDuplicates.length > 0 && (
          <Alert variant="warning">
            Found {possibleDuplicates.length} similar wine
            {possibleDuplicates.length !== 1 ? 's' : ''} already in your cellar:{' '}
            {possibleDuplicates
              .map((wine) => `${wine.winery} — ${wine.name} (${wine.year})`)
              .join('; ')}
          </Alert>
        )}

        {priceSuggestion != null && (
          <Alert variant="info">
            Found listed price: ${priceSuggestion.toFixed(2)}{' '}
            <button
              type="button"
              onClick={handleUseSuggestedPrice}
              className="underline hover:no-underline"
            >
              Use it
            </button>
          </Alert>
        )}

        <WineFormFields value={formData} onChange={setFormData} disabled={isSubmitting} />

        <ModalActions onCancel={handleClose} submitLabel="Add Wine" submitting={isSubmitting} />
      </form>
    </Modal>
  );
}
