import { useState, useEffect, useCallback, useRef } from 'react';
import type { Space } from '@/lib/types';

export function useCurrentSpace(spaces: Space[]) {
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || spaces.length === 0) return;

    const stored = localStorage.getItem('currentSpaceId');
    const storedSpaceExists = stored && spaces.some((s) => s.id === stored);

    // Only initialize once or when stored space exists
    if (!isInitialized.current || storedSpaceExists) {
      if (storedSpaceExists) {
        setCurrentSpaceId(stored);
        isInitialized.current = true;
      } else if (!isInitialized.current && spaces.length > 0) {
        const firstSpaceId = spaces[0].id;
        setCurrentSpaceId(firstSpaceId);
        localStorage.setItem('currentSpaceId', firstSpaceId);
        isInitialized.current = true;
      }
    }
  }, [spaces]);

  const selectSpace = useCallback((spaceId: string) => {
    setCurrentSpaceId(spaceId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentSpaceId', spaceId);
    }
  }, []);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || null;

  return { currentSpace, currentSpaceId, selectSpace };
}
