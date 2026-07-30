import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractWineLabel } from '@/lib/dio/client';
import type { DioExtractResponse } from '@/lib/dio/types';

vi.mock('@vercel/oidc-aws-credentials-provider', () => ({
  awsCredentialsProvider: vi.fn(() => vi.fn()),
}));

vi.mock('@smithy/signature-v4', () => {
  class MockSignatureV4 {
    sign() {
      return Promise.resolve({
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'AWS4-HMAC-SHA256 ...' },
      });
    }
  }
  return { SignatureV4: MockSignatureV4 };
});

describe('extractWineLabel', () => {
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
    process.env.DIO_FUNCTION_URL = 'https://example.lambda-url.us-east-1.on.aws/';
    process.env.AWS_ROLE_ARN = 'arn:aws:iam::123456789012:role/test-invoke';
    process.env.AWS_REGION = 'us-east-1';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.DIO_FUNCTION_URL;
    delete process.env.AWS_ROLE_ARN;
    delete process.env.AWS_REGION;
  });

  it('returns the parsed response on success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await extractWineLabel([{ data: 'base64data', media_type: 'image/jpeg' }]);

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      process.env.DIO_FUNCTION_URL,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('throws when the Lambda responds with a non-2xx status', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(
      extractWineLabel([{ data: 'base64data', media_type: 'image/jpeg' }])
    ).rejects.toThrow('500');
  });

  it('throws when required env vars are missing', async () => {
    delete process.env.DIO_FUNCTION_URL;

    await expect(
      extractWineLabel([{ data: 'base64data', media_type: 'image/jpeg' }])
    ).rejects.toThrow(/DIO_FUNCTION_URL/);
  });
});
