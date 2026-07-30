import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LabelScanner } from '@/components/wine/LabelScanner';
import type { DioExtractResponse } from '@/lib/dio/types';

const mockResponse: DioExtractResponse = {
  schema_version: 1,
  label: {
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
  },
  enrichment: { matched: false, wine_searcher_url: null, price: null, critic_score: null },
  meta: { model: 'claude-haiku-4-5', extracted_at: '2026-07-30T05:41:10.081662Z', warnings: [] },
};

function makeFile(name = 'label.jpg'): File {
  return new File(['fake-image-bytes'], name, { type: 'image/jpeg' });
}

function selectFiles(input: HTMLElement, files: File[]) {
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  fireEvent.change(input);
}

describe('LabelScanner', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal(
      'FileReader',
      class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        result: string | null = null;

        readAsDataURL() {
          this.result = 'data:image/jpeg;base64,ZmFrZS1pbWFnZS1ieXRlcw==';
          this.onload?.();
        }
      }
    );
    vi.stubGlobal(
      'URL',
      Object.assign(Object.create(URL), {
        createObjectURL: vi.fn(() => 'blob:mock'),
        revokeObjectURL: vi.fn(),
      })
    );
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 2000, height: 1000 }));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob(['resized-bytes'], { type: 'image/jpeg' }));
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('disables the scan button until a photo is selected', () => {
    render(<LabelScanner onExtracted={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Scan Label' })).toBeDisabled();
  });

  it('scans selected photos and calls onExtracted on success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const onExtracted = vi.fn();
    render(<LabelScanner onExtracted={onExtracted} />);

    const input = screen.getByLabelText('Scan a label photo', { selector: 'input' });
    selectFiles(input, [makeFile()]);

    const scanButton = screen.getByRole('button', { name: 'Scan Label' });
    expect(scanButton).not.toBeDisabled();
    fireEvent.click(scanButton);

    await waitFor(() => expect(onExtracted).toHaveBeenCalledWith(mockResponse));

    expect(fetch).toHaveBeenCalledWith(
      '/api/extract-label',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('shows an error and keeps photos selected when the scan fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'boom' }),
    } as Response);

    const onExtracted = vi.fn();
    render(<LabelScanner onExtracted={onExtracted} />);

    const input = screen.getByLabelText('Scan a label photo', { selector: 'input' });
    selectFiles(input, [makeFile()]);
    fireEvent.click(screen.getByRole('button', { name: 'Scan Label' }));

    await waitFor(() => expect(screen.getByText('boom')).toBeInTheDocument());
    expect(onExtracted).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Scan Label' })).not.toBeDisabled();
  });
});
