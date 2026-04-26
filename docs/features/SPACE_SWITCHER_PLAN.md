# Priority 1: Space Switcher + Multi-Space Support

## Overview

Enable users to view and switch between multiple spaces (fridges, cellars, racks). Currently, the UI only displays `spaces[0]`, hiding the multi-space capability that exists in the database.

## Goals

1. Display a space switcher in the header
2. Allow users to select which space to view
3. Persist selected space in browser session
4. Create new spaces via UI
5. Show space metadata (name, capacity, type)

## Database Schema (Already Exists)

```sql
-- spaces table
id UUID
owner_user_id UUID (FK to auth.users)
name TEXT
description TEXT
rows INTEGER (1-100)
columns INTEGER (1-100)
space_type TEXT (fridge, cellar, rack)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## UI Components to Create/Modify

### 1. SpaceSwitcher Component (`src/components/SpaceSwitcher.tsx`)

**Purpose**: Dropdown to select current space

**Props**:

```typescript
interface SpaceSwitcherProps {
  spaces: Space[];
  currentSpaceId: string | null;
  onSpaceChange: (spaceId: string) => void;
  onCreateNew: () => void;
}
```

**Features**:

- Dropdown showing space names with type badges
- Show capacity: "20/24 bottles (83%)"
- "Create New Space" option at bottom
- Keyboard navigation (arrow keys, enter)
- Mobile-friendly (full-width modal on small screens)

**Visual Design**:

```
┌─────────────────────────────────┐
│ Kitchen Fridge (fridge) ✓       │
│ 20/24 bottles (83%)             │
├─────────────────────────────────┤
│ Basement Cellar (cellar)        │
│ 45/60 bottles (75%)             │
├─────────────────────────────────┤
│ + Create New Space              │
└─────────────────────────────────┘
```

### 2. CreateSpaceModal Component (`src/components/CreateSpaceModal.tsx`)

**Purpose**: Modal to create a new space

**Props**:

```typescript
interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (space: NewSpace) => Promise<void>;
}
```

**Form Fields**:

- Name (required, text input)
- Description (optional, textarea)
- Space Type (required, radio buttons: fridge/cellar/rack)
- Grid Size:
  - Columns (1-100, default 4)
  - Rows (1-100, default 6)
  - Show calculated capacity: "24 slots (4 × 6)"

**Validation**:

- Name: 1-100 characters
- Rows/Columns: 1-100
- Total capacity warning if > 500 slots

**Presets** (optional enhancement):

- Small Fridge: 4×6 (24 bottles)
- Standard Fridge: 6×8 (48 bottles)
- Wine Rack: 12×4 (48 bottles)
- Large Cellar: 10×10 (100 bottles)
- Custom

### 3. SpaceInfo Component (`src/components/SpaceInfo.tsx`)

**Purpose**: Display space metadata and quick actions

**Props**:

```typescript
interface SpaceInfoProps {
  space: Space;
  bottleCount: number;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}
```

**Display**:

- Space name
- Space type badge
- Description (if exists)
- Capacity indicator: "20/24 bottles"
- Actions: Edit, Share, Delete

### 4. Modify Existing Components

#### `src/app/page.tsx`

- Add state for `currentSpaceId`
- Persist selection to `localStorage`
- Pass `currentSpaceId` to `useBottles` hook
- Add `SpaceSwitcher` to header
- Handle space creation
- Show space info/actions

#### `src/components/WineFridgeGrid.tsx`

- Accept `rows` and `columns` props (instead of hardcoded 24)
- Generate slots dynamically: `Array.from({ length: rows * columns })`
- Adjust grid layout classes based on columns

## Hooks to Create/Modify

### 1. Modify `src/hooks/useSpaces.ts`

**Add functions**:

```typescript
export function useSpaces() {
  // Existing: spaces, loading, error

  // New:
  const createSpace = async (space: NewSpace): Promise<Space | null> => { ... };
  const updateSpace = async (id: string, updates: UpdateSpace): Promise<boolean> => { ... };
  const deleteSpace = async (id: string): Promise<boolean> => { ... };

  return {
    spaces,
    loading,
    error,
    createSpace,  // NEW
    updateSpace,  // NEW
    deleteSpace,  // NEW
    refetch,
  };
}
```

### 2. Create `src/hooks/useCurrentSpace.ts`

**Purpose**: Manage current space selection with persistence

```typescript
export function useCurrentSpace(spaces: Space[]) {
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('currentSpaceId');
    if (stored && spaces.some((s) => s.id === stored)) {
      setCurrentSpaceId(stored);
    } else if (spaces.length > 0) {
      setCurrentSpaceId(spaces[0].id);
    }
  }, [spaces]);

  // Save to localStorage when changed
  const selectSpace = useCallback((spaceId: string) => {
    setCurrentSpaceId(spaceId);
    localStorage.setItem('currentSpaceId', spaceId);
  }, []);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || spaces[0] || null;

  return { currentSpace, currentSpaceId, selectSpace };
}
```

## Utility Functions

### 1. Add to `src/lib/utils.ts`

```typescript
export function calculateCapacity(space: Space): {
  total: number;
  used: number;
  percentage: number;
} {
  const total = space.rows * space.columns;
  return { total, used: 0, percentage: 0 }; // used is passed separately
}

export function formatCapacity(used: number, total: number): string {
  const percentage = total > 0 ? Math.round((used / total) * 100) : 0;
  return `${used}/${total} bottles (${percentage}%)`;
}

export function getSpaceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    fridge: 'Wine Fridge',
    cellar: 'Wine Cellar',
    rack: 'Wine Rack',
  };
  return labels[type] || type;
}

export function getSpaceTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    fridge: '❄️',
    cellar: '🏛️',
    rack: '📦',
  };
  return icons[type] || '📍';
}
```

## Implementation Steps

### Phase 1: Basic Space Switching (MVP)

1. Create `SpaceSwitcher` component (simple dropdown)
2. Add `currentSpaceId` state to `page.tsx`
3. Pass `currentSpaceId` to `useBottles` (already supported!)
4. Persist selection to localStorage
5. Update header to show space switcher

### Phase 2: Create New Space

1. Create `CreateSpaceModal` component
2. Add `createSpace` function to `useSpaces` hook
3. Wire up "Create New Space" button
4. Handle space creation success (select new space)

### Phase 3: Dynamic Grid

1. Modify `WineFridgeGrid` to accept `rows` and `columns` props
2. Generate slots dynamically based on space configuration
3. Adjust grid CSS classes for different layouts
4. Handle edge cases (very large/small grids)

### Phase 4: Space Management

1. Create `SpaceInfo` component
2. Add edit space functionality
3. Add delete space (with confirmation)
4. Show space description and metadata

## Edge Cases & Considerations

1. **No Spaces**: Show onboarding prompt to create first space
2. **Single Space**: Still show switcher (for consistency), or hide if only one space
3. **Space Deleted**: If current space is deleted, switch to first available space
4. **Large Grids**: Warn if creating space > 500 slots (performance concern)
5. **Mobile Layout**: Ensure grid remains usable with different column counts
6. **3D View**: May need to disable for non-4×6 grids initially

## Testing Strategy

### Unit Tests

- `useCurrentSpace` hook (localStorage persistence)
- `calculateCapacity` utility function
- `formatCapacity` utility function
- `getSpaceTypeLabel` utility function

### Component Tests

- `SpaceSwitcher` renders all spaces
- `SpaceSwitcher` calls `onSpaceChange` when selecting
- `CreateSpaceModal` validates form inputs
- `CreateSpaceModal` calculates capacity correctly

### Integration Tests

- Create new space → automatically selected
- Switch spaces → grid updates
- Delete current space → switches to another

## UI/UX Considerations

1. **Space Indicator**: Always show current space name in header (even on mobile)
2. **Loading States**: Show skeleton while switching spaces
3. **Empty States**: "This space is empty. Add your first bottle!"
4. **Confirmation**: Confirm before deleting space with bottles
5. **Success Messages**: Toast notification on create/update/delete
6. **Keyboard Shortcuts**: Cmd+K to open space switcher (power user feature)

## Future Enhancements (Out of Scope)

- Drag & drop to reorder spaces
- Space templates (presets with bottle recommendations)
- Space sharing UI (Priority 2)
- Duplicate space (copy all bottles to new space)
- Archive space (hide but keep data)
- Space color themes

## Success Metrics

- Users can view all their spaces
- Users can create new spaces with custom dimensions
- Space selection persists across sessions
- Grid layout adapts to different space sizes
- No performance degradation with multiple spaces
