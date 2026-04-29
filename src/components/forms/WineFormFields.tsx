import { WineType } from '@/lib/types';
import { FormInput } from './FormInput';
import { FormTextarea } from './FormTextarea';

export interface WineFormData {
  winery: string;
  name: string;
  type: WineType;
  year: number;
  price: string;
  score: string;
  notes: string;
}

export interface WineFormFieldsProps {
  value: WineFormData;
  onChange: (data: WineFormData) => void;
  disabled?: boolean;
  showNotes?: boolean;
  errors?: Partial<Record<keyof WineFormData, string>>;
}

export function WineFormFields({
  value,
  onChange,
  disabled = false,
  showNotes = true,
  errors = {},
}: WineFormFieldsProps) {
  const handleChange = (field: keyof WineFormData, fieldValue: string | number) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <>
      <FormInput
        label="Winery *"
        value={value.winery}
        onChange={(e) => handleChange('winery', e.target.value)}
        placeholder="e.g., Château Margaux"
        disabled={disabled}
        required
        error={errors.winery}
      />

      <FormInput
        label="Wine Name *"
        value={value.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="e.g., Cabernet Sauvignon"
        disabled={disabled}
        required
        error={errors.name}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Wine Type *</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(WineType).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange('type', type)}
              disabled={disabled}
              className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors capitalize ${
                value.type === type
                  ? 'border-wine-red bg-wine-red text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
      </div>

      <FormInput
        label="Year *"
        type="number"
        value={value.year}
        onChange={(e) => handleChange('year', parseInt(e.target.value) || new Date().getFullYear())}
        min={1900}
        max={2100}
        disabled={disabled}
        required
        error={errors.year}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Price (USD)"
          type="number"
          value={value.price}
          onChange={(e) => handleChange('price', e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          disabled={disabled}
          error={errors.price}
        />

        <FormInput
          label="Score (0-100)"
          type="number"
          value={value.score}
          onChange={(e) => handleChange('score', e.target.value)}
          placeholder="0"
          min="0"
          max="100"
          disabled={disabled}
          error={errors.score}
        />
      </div>

      {showNotes && (
        <FormTextarea
          label="Tasting Notes"
          value={value.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add tasting notes, pairing suggestions, etc."
          rows={3}
          disabled={disabled}
          error={errors.notes}
        />
      )}
    </>
  );
}
