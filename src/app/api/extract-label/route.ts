import { NextResponse } from 'next/server';
import { extractWineLabel } from '@/lib/dio/client';
import { getErrorMessage } from '@/lib/errorHandling';
import { logger } from '@/lib/logger';
import type { DioImageInput } from '@/lib/dio/types';

// The dio Lambda rejects any single decoded image over 5MB, and AWS Lambda Function URLs cap
// the whole request payload at 6MB — these caps stay comfortably under both, accounting for
// base64's ~33% size inflation and JSON overhead.
const MAX_IMAGE_BASE64_LENGTH = 6 * 1024 * 1024;
const MAX_TOTAL_BASE64_LENGTH = 7 * 1024 * 1024;
const MAX_IMAGES = 4;

function validateImage(image: unknown, index: number): string | null {
  if (typeof image !== 'object' || image === null) {
    return `images[${index}] must be an object`;
  }

  const { data, media_type: mediaType } = image as { data?: unknown; media_type?: unknown };

  if (typeof data !== 'string' || !data) {
    return `images[${index}].data (base64 image) is required`;
  }

  if (typeof mediaType !== 'string' || !mediaType) {
    return `images[${index}].media_type is required`;
  }

  if (data.length > MAX_IMAGE_BASE64_LENGTH) {
    return `images[${index}] is too large`;
  }

  return null;
}

export async function POST(req: Request) {
  let payload: { images?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  const { images } = payload;

  if (!Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ error: '"images" must be a non-empty array' }, { status: 400 });
  }

  if (images.length > MAX_IMAGES) {
    return NextResponse.json(
      { error: `"images" must contain at most ${MAX_IMAGES} items` },
      { status: 400 }
    );
  }

  for (let i = 0; i < images.length; i++) {
    const validationError = validateImage(images[i], i);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
  }

  const totalBase64Length = images.reduce(
    (sum, image) => sum + (image as { data: string }).data.length,
    0
  );
  if (totalBase64Length > MAX_TOTAL_BASE64_LENGTH) {
    return NextResponse.json(
      { error: 'Combined image size is too large — try fewer or smaller photos' },
      { status: 400 }
    );
  }

  try {
    const result = await extractWineLabel(images as DioImageInput[]);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.apiError('POST', '/api/extract-label', error);
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to extract wine label') },
      { status: 502 }
    );
  }
}
