# URL-Based Space Selection

## Overview

Space selection is now handled via URL query parameters instead of localStorage, enabling deep linking and proper browser navigation.

## Implementation Date

April 26, 2026

## Problem Solved

**Previous Implementation (localStorage)**:

- Space selection stored in `localStorage`
- No way to share direct links to specific spaces
- Browser back/forward didn't work correctly
- Race conditions during navigation between pages
- Debugging difficult (state not visible in URL)

**New Implementation (URL params)**:

- Space selection in URL: `/?space=<space-id>`
- Deep linking works: bookmark or share specific space URLs
- Browser navigation works correctly
- URL is single source of truth
- Debuggable: can see current space in address bar

## Technical Changes

### `src/hooks/useCurrentSpace.ts`

Complete rewrite to use Next.js `useSearchParams` and `useRouter`:

```typescript
const searchParams = useSearchParams();
const spaceIdFromUrl = searchParams.get('space');

// Derive current space from URL param
const currentSpace = useMemo(() => {
  if (spaces.length === 0) return null;
  if (spaceIdFromUrl) {
    return spaces.find((s) => s.id === spaceIdFromUrl) || null;
  }
  return spaces[0]; // default to first space
}, [spaces, spaceIdFromUrl]);

// Update URL when selecting space
const selectSpace = (spaceId: string) => {
  const params = new URLSearchParams(window.location.search);
  params.set('space', spaceId);
  router.push(`/?${params.toString()}`, { scroll: false });
};
```

### `src/app/spaces/page.tsx`

Simplified "View Space" navigation:

```typescript
const handleViewSpace = (spaceId: string) => {
  router.push(`/?space=${spaceId}`);
};
```

### `src/hooks/useBottles.ts`

Added guard to prevent fetching bottles without a space ID:

```typescript
if (!user || !spaceId) {
  setBottles([]);
  setLoading(false);
  return;
}
```

This eliminated unfiltered bottle requests that were showing wrong data.

## User Flow

### Viewing a Space

1. User clicks "View Space" on `/spaces` page
2. Navigates to `/?space=abc123`
3. Main page reads `space` param from URL
4. Displays bottles for that specific space
5. URL in address bar reflects current space

### Switching Spaces

1. User clicks space switcher in header
2. `selectSpace(newSpaceId)` updates URL
3. URL changes to `/?space=xyz789`
4. React re-renders with new space data
5. Browser back button works to return to previous space

### Deep Linking

1. User bookmarks `/?space=abc123`
2. Later visits bookmark directly
3. App loads and reads `space=abc123` from URL
4. Automatically displays that space
5. No need to select space manually

### First Load

1. New user visits `/` with no `?space` param
2. Hook detects no spaces exist → shows "Create Space" CTA
3. After creating first space, URL becomes `/?space=<new-id>`
4. Subsequent visits remember last space via URL

## Performance Improvements

### Before (localStorage)

When navigating from Spaces page to Home:

- 2x `/spaces` requests (duplicate)
- 2x `/bottle_instances` WITHOUT filter (all bottles)
- 1x `/bottle_instances?space_id=eq.xxx` (correct)
- **Wrong space data shown briefly**

### After (URL params)

When navigating from Spaces page to Home:

- 1x `/spaces` request
- 1x `/bottle_instances?space_id=eq.xxx` (filtered correctly)
- **Correct space data from the start**

## Edge Cases Handled

1. **Invalid space ID in URL**: Falls back to first space, doesn't crash
2. **No spaces exist**: Shows "Create Space" CTA instead of empty grid
3. **Space deleted**: URL param becomes invalid, redirects to first space
4. **Multiple tabs**: Each tab can view different space independently
5. **Shared URLs**: Recipients see the same space as sender

## Benefits

✅ **Deep linking**: Share `/?space=abc123` with household members  
✅ **Browser nav**: Back/forward buttons work correctly  
✅ **Debugging**: Can see which space is selected in URL  
✅ **Bookmarking**: Bookmark specific spaces for quick access  
✅ **No race conditions**: URL is authoritative, no sync issues  
✅ **Better UX**: Navigation feels more natural and predictable

## Related Changes

- Removed all `localStorage.setItem('currentSpaceId')` calls
- Removed `localStorage.getItem('currentSpaceId')` initialization
- Updated `AuthContext.signOut()` to remove old localStorage cleanup
- Added `hasSetDefaultSpace` ref to prevent URL thrashing on load

## Future Enhancements

- Add space name to URL as slug: `/?space=my-kitchen-fridge-abc123`
- Support `/spaces/:id` route instead of query param
- Add URL state for filters (e.g., `/?space=abc&type=red`)
- Preserve scroll position when navigating between spaces

## Testing

Manual testing verified:

- Direct navigation to `/?space=xxx` works
- Space switcher updates URL correctly
- Browser back/forward work as expected
- Bookmarking and sharing URLs work
- No duplicate or unfiltered API requests
- Correct space data shown on all navigations

## Migration Notes

No data migration needed - this is purely a frontend routing change. Users won't notice any difference except that their URLs will now contain `?space=xxx`.

Old localStorage values are ignored and will eventually be garbage collected by the browser.
