# Bug Fix: Space Selection After Logout

> **Note**: This localStorage-based approach was later superseded by URL-based space selection. See [URL_BASED_SPACE_SELECTION.md](../features/URL_BASED_SPACE_SELECTION.md) for the current implementation.

## Issue

**Reported:** April 26, 2026

When logging out and logging back in as a different user, the app would display the wrong space name (e.g., "Test space") but show bottles from the new user's first space. This created a confusing mismatch between the displayed space name and the actual bottles shown.

## Root Cause

Two related issues:

### 1. localStorage Persistence Across Users

**File:** `src/contexts/AuthContext.tsx`

The `signOut()` function was not clearing the `currentSpaceId` from localStorage. When a new user logged in:

1. Old user's `currentSpaceId` remained in localStorage
2. New user's spaces loaded (different IDs)
3. `useCurrentSpace` tried to use the old stored ID
4. ID didn't match any of the new user's spaces
5. Fell back to `spaces[0]` for display, but kept using old ID for queries

### 2. Inconsistent Space Selection Logic

**File:** `src/hooks/useCurrentSpace.ts`

The hook had inconsistent fallback logic:

```typescript
// Setting currentSpaceId
if (stored && spaces.some((s) => s.id === stored)) {
  setCurrentSpaceId(stored);
} else if (spaces.length > 0) {
  setCurrentSpaceId(spaces[0].id); // ❌ Not saved to localStorage
}

// Getting currentSpace
const currentSpace = spaces.find((s) => s.id === currentSpaceId) || spaces[0] || null;
//                                                                    ^^^^^^^^ Fallback without updating state
```

This caused:

- State to have one space ID (old/invalid)
- Display to show another space (first in list)
- Bottles query to fail or use wrong filter

## The Fix

### 1. Clear localStorage on Logout

**File:** `src/contexts/AuthContext.tsx`

```typescript
const signOut = async () => {
  await supabase.auth.signOut();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentSpaceId'); // ✅ Clear on logout
  }
};
```

### 2. Consistent Space Selection Logic

**File:** `src/hooks/useCurrentSpace.ts`

```typescript
useEffect(() => {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('currentSpaceId');
  const storedSpaceExists = stored && spaces.some((s) => s.id === stored);

  if (storedSpaceExists) {
    setCurrentSpaceId(stored);
  } else if (spaces.length > 0) {
    const firstSpaceId = spaces[0].id;
    setCurrentSpaceId(firstSpaceId);
    localStorage.setItem('currentSpaceId', firstSpaceId); // ✅ Save fallback to localStorage
  } else {
    setCurrentSpaceId(null);
    localStorage.removeItem('currentSpaceId'); // ✅ Clear if no spaces
  }
}, [spaces]);

// ✅ No fallback - use null if ID doesn't match
const currentSpace = spaces.find((s) => s.id === currentSpaceId) || null;
```

## Changes Made

### Before

```typescript
// signOut didn't clear localStorage
const signOut = async () => {
  await supabase.auth.signOut();
};

// Fallback happened at render time, not in state
const currentSpace = spaces.find((s) => s.id === currentSpaceId) || spaces[0] || null;
```

### After

```typescript
// signOut clears user-specific data
const signOut = async () => {
  await supabase.auth.signOut();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentSpaceId');
  }
};

// Fallback updates state and localStorage immediately
if (storedSpaceExists) {
  setCurrentSpaceId(stored);
} else if (spaces.length > 0) {
  const firstSpaceId = spaces[0].id;
  setCurrentSpaceId(firstSpaceId);
  localStorage.setItem('currentSpaceId', firstSpaceId);
} else {
  setCurrentSpaceId(null);
  localStorage.removeItem('currentSpaceId');
}

// No render-time fallback needed
const currentSpace = spaces.find((s) => s.id === currentSpaceId) || null;
```

## Testing

All tests pass (108 tests):

- ✅ Type checking
- ✅ Linting
- ✅ Formatting
- ✅ Unit tests

## Verification Steps

To verify the fix:

1. Log in as User A
2. Create/select a space
3. Log out
4. Log in as User B
5. Verify:
   - ✅ Correct space name displayed
   - ✅ Correct bottles shown (User B's bottles)
   - ✅ No "Test space" or other user's space name
   - ✅ Space switcher shows correct spaces

## Related Files

- `src/contexts/AuthContext.tsx` - Logout cleanup
- `src/hooks/useCurrentSpace.ts` - Space selection logic
- `src/hooks/useBottles.ts` - Depends on correct spaceId

## Impact

This bug could have caused:

- User confusion (wrong space name)
- Data leakage appearance (bottles from wrong user/space)
- Trust issues (app showing unexpected data)

The fix ensures:

- Clean slate on logout
- Consistent space selection
- No cross-user data confusion

## Prevention

To prevent similar issues:

1. **Always clear user-specific localStorage on logout**
2. **Validate stored IDs belong to current user's data**
3. **Keep state and localStorage in sync**
4. **Avoid render-time fallbacks that bypass state**

## Future Improvements

Consider:

1. **User-scoped localStorage keys**
   - Store as `currentSpaceId_${userId}`
   - Automatically namespace by user

2. **Session storage for temporary state**
   - Use sessionStorage instead of localStorage
   - Auto-clears on browser close

3. **State validation hook**
   - Centralized hook to validate/clean user state
   - Run on login/logout/user change

4. **More comprehensive logout**
   - Clear all app-specific localStorage keys
   - Reset all user-specific state
