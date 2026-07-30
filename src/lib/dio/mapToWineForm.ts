import { WineType } from '@/lib/types';
import type { WineFormData } from '@/lib/types';
import type { DioLabel } from '@/lib/dio/types';

export function matchWineType(raw: string | null): WineType {
  if (!raw) {
    return WineType.OTHER;
  }

  const normalized = raw.trim().toLowerCase();
  const match = Object.values(WineType).find((type) => type === normalized);
  return match ?? WineType.OTHER;
}

export function mapLabelToWineForm(label: DioLabel, currentYear: number): Partial<WineFormData> {
  return {
    winery: label.producer ?? '',
    name: label.wine_name ?? '',
    type: matchWineType(label.wine_type),
    year: label.vintage ?? currentYear,
  };
}

export function summarizeLabelDetails(label: DioLabel): string {
  const parts: string[] = [];

  if (label.region) {
    parts.push(label.region);
  }

  if (label.appellation && label.appellation !== label.region) {
    parts.push(label.appellation);
  }

  if (label.grape_varieties.length > 0) {
    parts.push(label.grape_varieties.join(', '));
  }

  if (label.abv_percent != null) {
    parts.push(`${label.abv_percent}% ABV`);
  }

  if (label.volume_ml != null) {
    parts.push(`${label.volume_ml}ml`);
  }

  if (label.classification) {
    parts.push(label.classification);
  }

  if (label.closure) {
    parts.push(label.closure);
  }

  if (label.certifications.length > 0) {
    parts.push(label.certifications.join(', '));
  }

  return parts.join(' · ');
}
