'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { DioExtractResponse } from '@/lib/dio/types';

const MAX_PHOTOS = 4;
// The dio Lambda caps raw (decoded) image size at 5MB, and Lambda Function URLs cap the
// whole request payload at 6MB — a phone photo easily exceeds both, so downscale before upload.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

interface LabelScannerProps {
  onExtracted: (response: DioExtractResponse) => void;
}

interface Photo {
  file: File;
  previewUrl: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.slice(result.indexOf(',') + 1);
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function resizeImage(file: File): Promise<{ data: string; media_type: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is not supported in this browser');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Failed to encode image'))),
      'image/jpeg',
      JPEG_QUALITY
    );
  });

  return { data: await blobToBase64(blob), media_type: 'image/jpeg' };
}

export function LabelScanner({ onExtracted }: LabelScannerProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';

    setPhotos((prev) => {
      const combined = [
        ...prev,
        ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
      ];
      return combined.slice(0, MAX_PHOTOS);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleScan = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const images = await Promise.all(photos.map((photo) => resizeImage(photo.file)));

      const response = await fetch('/api/extract-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to scan label');
      }

      const result = (await response.json()) as DioExtractResponse;
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setPhotos([]);
      onExtracted(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <label htmlFor="label-photos" className="text-sm font-medium text-gray-700">
          Scan a label photo
        </label>
        <label
          htmlFor="label-photos"
          className="text-sm text-wine-red hover:underline cursor-pointer"
        >
          {photos.length > 0 ? 'Add photo' : 'Choose photo(s)'}
        </label>
        <input
          id="label-photos"
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          disabled={isScanning || photos.length >= MAX_PHOTOS}
          onChange={handleFilesSelected}
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo, index) => (
            <div key={photo.previewUrl} className="relative">
              <img
                src={photo.previewUrl}
                alt={`Label photo ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                disabled={isScanning}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full w-5 h-5 text-xs leading-none flex items-center justify-center disabled:opacity-50"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        fullWidth
        loading={isScanning}
        disabled={photos.length === 0}
        onClick={handleScan}
      >
        Scan Label
      </Button>
    </div>
  );
}
