import { Button } from '@/components/ui/Button';

export interface ModalActionsProps {
  onCancel: () => void;
  cancelLabel?: string;
  submitLabel: string;
  submitting?: boolean;
  submitDisabled?: boolean;
  submitType?: 'submit' | 'button';
  onSubmit?: () => void;
}

export function ModalActions({
  onCancel,
  cancelLabel = 'Cancel',
  submitLabel,
  submitting = false,
  submitDisabled = false,
  submitType = 'submit',
  onSubmit,
}: ModalActionsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <Button type="button" onClick={onCancel} variant="secondary" fullWidth disabled={submitting}>
        {cancelLabel}
      </Button>
      <Button
        type={submitType}
        onClick={submitType === 'button' ? onSubmit : undefined}
        loading={submitting}
        disabled={submitDisabled}
        fullWidth
      >
        {submitLabel}
      </Button>
    </div>
  );
}
