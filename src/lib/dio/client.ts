import { HttpRequest } from '@smithy/protocol-http';
import { SignatureV4 } from '@smithy/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider';
import { logger } from '@/lib/logger';
import type { DioImageInput, DioExtractResponse } from '@/lib/dio/types';

export async function extractWineLabel(images: DioImageInput[]): Promise<DioExtractResponse> {
  const functionUrl = process.env.DIO_FUNCTION_URL;
  const roleArn = process.env.AWS_ROLE_ARN;
  const region = process.env.AWS_REGION;

  if (!functionUrl || !roleArn || !region) {
    throw new Error('DIO_FUNCTION_URL, AWS_ROLE_ARN, and AWS_REGION must be set');
  }

  const url = new URL(functionUrl);
  const body = JSON.stringify({ images });

  const request = new HttpRequest({
    method: 'POST',
    protocol: url.protocol,
    hostname: url.hostname,
    path: url.pathname,
    headers: {
      'content-type': 'application/json',
      host: url.hostname,
    },
    body,
  });

  const signer = new SignatureV4({
    credentials: awsCredentialsProvider({ roleArn, clientConfig: { region } }),
    region,
    service: 'lambda',
    sha256: Sha256,
  });

  const signedRequest = await signer.sign(request);

  logger.apiCall('POST', functionUrl);

  const response = await fetch(functionUrl, {
    method: signedRequest.method,
    headers: signedRequest.headers,
    body,
  });

  if (!response.ok) {
    const error = new Error(`dio Lambda request failed with status ${response.status}`);
    logger.apiError('POST', functionUrl, error, { status: response.status });
    throw error;
  }

  const result = (await response.json()) as DioExtractResponse;
  logger.apiSuccess('POST', functionUrl);
  return result;
}
