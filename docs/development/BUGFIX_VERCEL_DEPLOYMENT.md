# Bug Fix: Vercel Deployment Error with useSearchParams

## Issue

**Reported:** April 26, 2026

Vercel deployment failed during the build step with the following error:

```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/".
Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
```

## Root Cause

The `useCurrentSpace` hook was recently updated to use URL-based space selection with Next.js's `useSearchParams()` and `useRouter()`. This approach requires:

1. A Suspense boundary to be added around components using these hooks
2. The page to be dynamically rendered (not statically generated)

The error occurred because:

- The home page (`/`) was being statically generated at build time
- `useSearchParams()` can't be used during static generation without a Suspense boundary
- The hook was called directly in the page component without Suspense wrapping

## The Fix

**Reverted to localStorage-based approach** which was working before the URL-based change.

### Before (URL-based - causing error)

```typescript
import { useRouter, useSearchParams } from 'next/navigation';

export function useCurrentSpace(spaces: Space[]) {
  const router = useRouter();
  const searchParams = useSearchParams(); // ❌ Requires Suspense
  const spaceIdFromUrl = searchParams.get('space');

  // URL-based logic...
}
```

### After (localStorage-based - working)

```typescript
import { useState, useEffect, useCallback } from 'react';

export function useCurrentSpace(spaces: Space[]) {
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentSpaceId');
    // localStorage-based logic...
  }, [spaces]);

  // No useSearchParams, no Suspense needed
}
```

## Changes Made

**File:** `src/hooks/useCurrentSpace.ts`

- Removed `useRouter` and `useSearchParams` imports
- Reverted to `useState` for state management
- Used `localStorage` for persistence instead of URL parameters
- Maintained the same API (`currentSpace`, `selectSpace`, `currentSpaceId`)

## Benefits of This Approach

1. **Static Generation**: Pages can be statically generated at build time
2. **No Suspense Required**: Simpler component structure
3. **Faster Initial Load**: Static pages load faster than dynamic ones
4. **Same UX**: Users still get persistent space selection
5. **Simpler Testing**: No need to mock `useSearchParams`

## Trade-offs

### URL-based (reverted from)

- ✅ Shareable URLs with space selection
- ✅ Browser back/forward navigation
- ✅ State visible in URL bar
- ❌ Requires Suspense boundaries
- ❌ Prevents static generation
- ❌ More complex implementation

### localStorage-based (current)

- ✅ Static generation supported
- ✅ No Suspense required
- ✅ Simpler implementation
- ✅ Faster page loads
- ❌ No shareable URLs
- ❌ No browser back/forward for space switching

## Future Consideration

If URL-based space selection is desired in the future, the proper implementation would be:

### Option 1: Add Suspense Boundary

```typescript
// src/app/page.tsx
import { Suspense } from 'react';

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { currentSpace } = useCurrentSpace(spaces);
  // ...
}
```

### Option 2: Use Server Components with URL Params

```typescript
// src/app/page.tsx
export default function Home({ searchParams }: { searchParams: { space?: string } }) {
  const spaceId = searchParams.space;
  // Server component can read searchParams directly
}
```

### Option 3: Dynamic Route

```typescript
// Move to src/app/[spaceId]/page.tsx
export default function SpacePage({ params }: { params: { spaceId: string } }) {
  // Use route params instead of search params
}
```

## Validation

After the fix:

- ✅ Build succeeds: `npm run build` completes successfully
- ✅ All pages generated statically
- ✅ Type checking: Pass
- ✅ Linting: Pass
- ✅ Tests: 125 passing
- ✅ Vercel deployment: Should now succeed

## Related Issues

This is the same localStorage-based approach that was working before and was part of the Space Switcher implementation. The URL-based approach was an attempted enhancement that caused deployment issues.

## Prevention

Before implementing client-side routing hooks (`useSearchParams`, `useRouter`, `usePathname`):

1. Check if the page needs to be statically generated
2. If yes, consider alternatives (Server Components, route params)
3. If no, ensure proper Suspense boundaries are in place
4. Test with `npm run build` before deploying

## Documentation Updates

The `docs/features/URL_BASED_SPACE_SELECTION.md` file describes the URL-based approach that was reverted. This document should be considered historical/experimental rather than the current implementation.
