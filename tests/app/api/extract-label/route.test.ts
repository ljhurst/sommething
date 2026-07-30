import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/extract-label/route';
import { extractWineLabel } from '@/lib/dio/client';
import type { DioExtractResponse } from '@/lib/dio/types';

vi.mock('@/lib/dio/client', () => ({
  extractWineLabel: vi.fn(),
}));

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/extract-label', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/extract-label', () => {
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
      barcode: '0120869633',
    },
    enrichment: { matched: false, wine_searcher_url: null, price: null, critic_score: null },
    meta: { model: 'claude-haiku-4-5', extracted_at: '2026-07-30T05:41:10.081662Z', warnings: [] },
  };

  beforeEach(() => {
    vi.mocked(extractWineLabel).mockReset();
  });

  it('returns 400 when the body is not valid JSON', async () => {
    const req = new Request('http://localhost/api/extract-label', {
      method: 'POST',
      body: 'not json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when "images" is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 when "images" is an empty array', async () => {
    const res = await POST(makeRequest({ images: [] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when "images" has more than 4 items', async () => {
    const image = { data: 'base64data', media_type: 'image/jpeg' };
    const res = await POST(makeRequest({ images: [image, image, image, image, image] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when an image is missing "data"', async () => {
    const res = await POST(makeRequest({ images: [{ media_type: 'image/jpeg' }] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when an image is missing "media_type"', async () => {
    const res = await POST(makeRequest({ images: [{ data: 'base64data' }] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when an image is too large', async () => {
    const res = await POST(
      makeRequest({
        images: [{ data: 'a'.repeat(7 * 1024 * 1024), media_type: 'image/jpeg' }],
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when the combined size of otherwise-valid images is too large', async () => {
    const image = { data: 'a'.repeat(3 * 1024 * 1024), media_type: 'image/jpeg' };
    const res = await POST(makeRequest({ images: [image, image, image] }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with the extracted label for a single image', async () => {
    vi.mocked(extractWineLabel).mockResolvedValue(mockResponse);

    const res = await POST(
      makeRequest({ images: [{ data: 'base64data', media_type: 'image/jpeg' }] })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockResponse);
  });

  it('returns 200 with the extracted label for multiple images', async () => {
    vi.mocked(extractWineLabel).mockResolvedValue(mockResponse);

    const res = await POST(
      makeRequest({
        images: [
          { data: 'front-base64', media_type: 'image/jpeg' },
          { data: 'back-base64', media_type: 'image/jpeg' },
        ],
      })
    );

    expect(res.status).toBe(200);
    expect(extractWineLabel).toHaveBeenCalledWith([
      { data: 'front-base64', media_type: 'image/jpeg' },
      { data: 'back-base64', media_type: 'image/jpeg' },
    ]);
  });

  it('returns 502 when the Lambda call fails', async () => {
    vi.mocked(extractWineLabel).mockRejectedValue(new Error('boom'));

    const res = await POST(
      makeRequest({ images: [{ data: 'base64data', media_type: 'image/jpeg' }] })
    );

    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe('boom');
  });
});
