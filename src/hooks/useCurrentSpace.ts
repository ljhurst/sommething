import { useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Space } from '@/lib/types';

export function useCurrentSpace(spaces: Space[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spaceIdFromUrl = searchParams.get('space');
  const hasSetDefaultSpace = useRef(false);

  const currentSpace = useMemo(() => {
    if (spaces.length === 0) return null;

    if (spaceIdFromUrl) {
      return spaces.find((s) => s.id === spaceIdFromUrl) || null;
    }

    return spaces[0];
  }, [spaces, spaceIdFromUrl]);

  useEffect(() => {
    if (hasSetDefaultSpace.current || spaces.length === 0 || spaceIdFromUrl) return;

    hasSetDefaultSpace.current = true;
    const params = new URLSearchParams(window.location.search);
    params.set('space', spaces[0].id);
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [spaces, spaceIdFromUrl, router]);

  const selectSpace = (spaceId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('space', spaceId);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return {
    currentSpace,
    currentSpaceId: currentSpace?.id || null,
    selectSpace,
  };
}
