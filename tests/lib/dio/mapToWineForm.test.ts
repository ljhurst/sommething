import { describe, it, expect } from 'vitest';
import { matchWineType, mapLabelToWineForm, summarizeLabelDetails } from '@/lib/dio/mapToWineForm';
import { WineType } from '@/lib/types';
import type { DioLabel } from '@/lib/dio/types';

function makeLabel(overrides: Partial<DioLabel> = {}): DioLabel {
  return {
    producer: 'Cloudline Cellars',
    wine_name: 'Cloudline',
    vintage: 2023,
    country_iso_alpha_3: 'USA',
    region: 'Willamette Valley',
    appellation: 'Willamette Valley',
    grape_varieties: ['Pinot Noir'],
    abv_percent: 13.5,
    volume_ml: 750,
    wine_type: 'red',
    classification: null,
    closure: null,
    certifications: [],
    barcode: null,
    ...overrides,
  };
}

describe('matchWineType', () => {
  it('matches a known wine_type case-insensitively', () => {
    expect(matchWineType('Red')).toBe(WineType.RED);
    expect(matchWineType('SPARKLING')).toBe(WineType.SPARKLING);
  });

  it('falls back to OTHER for an unrecognized wine_type', () => {
    expect(matchWineType('orange')).toBe(WineType.OTHER);
  });

  it('falls back to OTHER for null', () => {
    expect(matchWineType(null)).toBe(WineType.OTHER);
  });
});

describe('mapLabelToWineForm', () => {
  it('maps producer/wine_name/vintage/wine_type onto the form fields', () => {
    const result = mapLabelToWineForm(makeLabel(), 2026);
    expect(result).toEqual({
      winery: 'Cloudline Cellars',
      name: 'Cloudline',
      type: WineType.RED,
      year: 2023,
    });
  });

  it('falls back to the current year when vintage is null', () => {
    const result = mapLabelToWineForm(makeLabel({ vintage: null }), 2026);
    expect(result.year).toBe(2026);
  });

  it('falls back to empty strings when producer/wine_name are null', () => {
    const result = mapLabelToWineForm(makeLabel({ producer: null, wine_name: null }), 2026);
    expect(result.winery).toBe('');
    expect(result.name).toBe('');
  });
});

describe('summarizeLabelDetails', () => {
  it('builds a compact string from populated fields', () => {
    const result = summarizeLabelDetails(makeLabel());
    expect(result).toBe('Willamette Valley · Pinot Noir · 13.5% ABV · 750ml');
  });

  it('does not duplicate appellation when it matches region', () => {
    const result = summarizeLabelDetails(
      makeLabel({ region: 'Willamette Valley', appellation: 'Willamette Valley' })
    );
    expect(result).not.toMatch(/Willamette Valley.*Willamette Valley/);
  });

  it('includes appellation separately when it differs from region', () => {
    const result = summarizeLabelDetails(
      makeLabel({ region: 'Oregon', appellation: 'Willamette Valley' })
    );
    expect(result).toContain('Oregon');
    expect(result).toContain('Willamette Valley');
  });

  it('skips absent fields without stray separators', () => {
    const result = summarizeLabelDetails(
      makeLabel({
        region: null,
        appellation: null,
        grape_varieties: [],
        abv_percent: null,
        volume_ml: null,
        classification: null,
        closure: null,
        certifications: [],
      })
    );
    expect(result).toBe('');
  });

  it('includes classification, closure, and certifications when present', () => {
    const result = summarizeLabelDetails(
      makeLabel({
        classification: 'AVA',
        closure: 'Cork',
        certifications: ['Organic', 'Biodynamic'],
      })
    );
    expect(result).toContain('AVA');
    expect(result).toContain('Cork');
    expect(result).toContain('Organic, Biodynamic');
  });
});
