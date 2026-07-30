import { NextResponse } from 'next/server';
import { extractWineLabel } from '@/lib/dio/client';
import { getErrorMessage } from '@/lib/errorHandling';
import { logger } from '@/lib/logger';

const MAX_BASE64_LENGTH = 10 * 1024 * 1024; // ~7.5MB decoded, generous headroom over a phone photo

export async function POST(req: Request) {
  let payload: { data?: unknown; media_type?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  const { data, media_type: mediaType } = payload;

  if (typeof data !== 'string' || !data) {
    return NextResponse.json({ error: '"data" (base64 image) is required' }, { status: 400 });
  }

  if (typeof mediaType !== 'string' || !mediaType) {
    return NextResponse.json({ error: '"media_type" is required' }, { status: 400 });
  }

  if (data.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ error: 'Image is too large' }, { status: 400 });
  }

  try {
    const result = await extractWineLabel([{ data, media_type: mediaType }]);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.apiError('POST', '/api/extract-label', error);
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to extract wine label') },
      { status: 502 }
    );
  }
}
