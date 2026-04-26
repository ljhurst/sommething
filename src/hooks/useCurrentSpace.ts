import { useState, useEffect, useCallback } from 'react';
import type { Space } from '@/lib/types';

export function useCurrentSpace(spaces: Space[]) {
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('currentSpaceId');
    if (stored && spaces.some((s) => s.id === stored)) {
      setCurrentSpaceId(stored);
    } else if (spaces.length > 0) {
      setCurrentSpaceId(spaces[0].id);
    }
  }, [spaces]);

  const selectSpace = useCallback((spaceId: string) => {
    setCurrentSpaceId(spaceId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentSpaceId', spaceId);
    }
  }, []);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || spaces[0] || null;

  return { currentSpace, currentSpaceId, selectSpace };
}
