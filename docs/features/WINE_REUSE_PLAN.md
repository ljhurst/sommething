# Priority 2: Wine Reuse UI

## Overview

Guide users to reuse existing wine records instead of creating duplicates. The normalized schema separates wines from bottle instances, but the UI doesn't expose this—users always create new wines when adding bottles.

## Problem Statement

**Current Behavior**:

- User adds "Caymus Cabernet 2019" to Kitchen Fridge
- Later, user buys another bottle and adds "Caymus Cabernet 2019" to Basement Cellar
- **Result**: Two separate wine records with identical data

**Desired Behavior**:

- User adds "Caymus Cabernet 2019" (creates wine record)
- Later, user sees "Add existing wine" option
- User selects "Caymus Cabernet 2019" from dropdown
- **Result**: New bottle instance referencing same wine record

## Goals

1. Show existing wines when adding bottles
2. Allow quick add of existing wines to any space
3. Provide wine detail view showing all instances
4. Enable wine deduplication (merge duplicates)
5. Update wine once, reflect everywhere

## Database Schema (Already Exists)

The schema already supports this perfectly:

```sql
wines (canonical data)
  ↓ wine_id
bottle_instances (physical bottles)
  - wine_id (FK to wines)
  - space_id (FK to spaces)
  - slot_position
```

## UI Components to Create/Modify

### 1. Modify `AddBottleModal` Component

**Current Flow**:

```
[Add Bottle to Slot 5]

Winery: [________]
Name: [________]
Type: [Red ▼]
Year: [2019]
...

[Add Bottle]
```

**New Flow**:

```
[Add Bottle to Slot 5]

( ) Add New Wine
(•) Use Existing Wine

━━━ WHEN "ADD NEW WINE" SELECTED ━━━
Winery: [________]
Name: [________]
...

━━━ WHEN "USE EXISTING WINE" SELECTED ━━━
[Search or select wine...]
┌─────────────────────────────────────┐
│ 🍷 Caymus Cabernet 2019             │
│    $45 · Score 92 · In 2 spaces     │
├─────────────────────────────────────┤
│ 🍷 Stag's Leap Merlot 2020          │
│    $32 · Score 88 · In 1 space      │
└─────────────────────────────────────┘

[Add Bottle]
```

**Props** (modified):

```typescript
interface AddBottleModalProps {
  isOpen: boolean;
  slotNumber: number;
  spaceId: string;
  onClose: () => void;
  onSubmit: (wine: NewWine | string, slotPosition: number) => Promise<void>;
  // Note: onSubmit now accepts either NewWine (create) or string (wineId for existing)
}
```

**New State**:

```typescript
const [mode, setMode] = useState<'new' | 'existing'>('new');
const [selectedWineId, setSelectedWineId] = useState<string | null>(null);
const [searchTerm, setSearchTerm] = useState('');
```

### 2. WineSelector Component (`src/components/WineSelector.tsx`)

**Purpose**: Searchable dropdown for selecting existing wines

**Props**:

```typescript
interface WineSelectorProps {
  wines: Wine[];
  selectedWineId: string | null;
  onSelect: (wineId: string) => void;
  placeholder?: string;
}
```

**Features**:

- Instant search/filter by winery, name, or year
- Show wine metadata (price, score, type)
- Show usage: "In 2 spaces", "Consumed 3 times"
- Group by wine type (Red, White, Rosé, etc.)
- Sort by: Recently added, Name, Winery, Year

**Visual Design**:

```
[Search wines... 🔍]

RED WINES (12)
  🍷 Caymus Cabernet Sauvignon 2019
     $45 · Score 92 · In Kitchen Fridge, Basement Cellar

  🍷 Jordan Cabernet Sauvignon 2020
     $38 · Score 90 · In Kitchen Fridge

WHITE WINES (8)
  🍷 Chardonnay Reserve 2021
     $28 · Score 85 · In Wine Rack
```

### 3. WineDetailModal Component (`src/components/WineDetailModal.tsx`)

**Purpose**: View wine details and all instances across spaces

**Props**:

```typescript
interface WineDetailModalProps {
  isOpen: boolean;
  wine: Wine | null;
  onClose: () => void;
  onEdit: (wineId: string, updates: UpdateWine) => Promise<void>;
  onDelete: (wineId: string) => Promise<void>;
}
```

**Sections**:

1. **Wine Info**:
   - Winery, Name, Year, Type
   - Price, Score (editable)
   - Notes (editable)

2. **Current Bottles** (list of bottle_instances):
   - Space name + slot position
   - Added date
   - "View in Space" link
   - "Remove" button

3. **Consumption History**:
   - Date consumed
   - Who consumed (if shared space)
   - From which space
   - Rating & notes

4. **Actions**:
   - Edit Wine Details
   - Add Another Bottle
   - Delete Wine (if no instances/consumptions)

**Visual Design**:

```
┌────────────────────────────────────┐
│ Caymus Cabernet Sauvignon 2019     │
│ Caymus Vineyards                   │
│ Red Wine · $45 · Score 92          │
├────────────────────────────────────┤
│ CURRENT BOTTLES (2)                │
│ · Kitchen Fridge, Slot 12          │
│   Added Mar 15, 2026               │
│ · Basement Cellar, Slot 5          │
│   Added Apr 1, 2026                │
├────────────────────────────────────┤
│ CONSUMPTION HISTORY (3)            │
│ · Dec 25, 2025 from Kitchen Fridge │
│   👍 "Perfect with steak"          │
│ · Nov 10, 2025 from Kitchen Fridge │
│   👍 "Great wine"                  │
└────────────────────────────────────┘

[Edit Details] [Add Another Bottle] [Delete Wine]
```

### 4. WineDeduplicationTool Component (`src/components/WineDeduplicationTool.tsx`)

**Purpose**: Find and merge duplicate wine records

**Flow**:

1. Scan for potential duplicates (fuzzy match on winery/name/year)
2. Show grouped duplicates with checkboxes
3. User selects which wines to merge
4. User picks primary wine (others merge into it)
5. Update all bottle_instances and consumptions to reference primary wine
6. Delete duplicate wine records

**Algorithm**:

```typescript
function findDuplicates(wines: Wine[]): Wine[][] {
  // Group by normalized winery + name + year
  // Consider:
  // - Case-insensitive matching
  // - Trim whitespace
  // - Handle common abbreviations (Cab → Cabernet)
  // - Fuzzy match winery names (Caymus vs Caymus Vineyards)
}
```

**Visual Design**:

```
Wine Deduplication Tool

Found 3 potential duplicates:

┌────────────────────────────────────┐
│ [✓] Caymus Cabernet 2019           │
│     · $45, Score 92, In 2 spaces   │
│ [✓] Caymus Cabernet Sauvignon 2019 │
│     · $45, Score 92, In 1 space    │
│                                     │
│ Select primary: ( ) First (•) Second │
│ [Merge These Wines]                │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ [✓] Jordan Cab 2020                │
│     · $38, In 1 space              │
│ [✓] Jordan Cabernet 2020           │
│     · $38, Score 90, In 1 space    │
│                                     │
│ Select primary: (•) First ( ) Second │
│ [Merge These Wines]                │
└────────────────────────────────────┘
```

## Hooks to Create/Modify

### 1. Modify `src/hooks/useWines.ts`

**Add functions**:

```typescript
export function useWines() {
  // Existing: addWine, updateWine, deleteWine (if they exist)

  // New:
  const getWines = async (): Promise<Wine[]> => {
    // Fetch all wines user has access to
    // Include wines they created OR wines in their spaces
  };

  const getWineDetails = async (
    wineId: string
  ): Promise<{
    wine: Wine;
    instances: BottleInstance[];
    consumptions: Consumption[];
  }> => {
    // Fetch wine + all related data
  };

  const mergeWines = async (
    primaryWineId: string,
    duplicateWineIds: string[]
  ): Promise<boolean> => {
    // 1. Update bottle_instances: wine_id → primaryWineId
    // 2. Update consumptions: wine_id → primaryWineId
    // 3. Delete duplicate wines
  };

  const searchWines = async (query: string): Promise<Wine[]> => {
    // Search by winery, name, or year
  };

  return {
    wines,
    loading,
    error,
    getWines, // NEW
    getWineDetails, // NEW
    mergeWines, // NEW
    searchWines, // NEW
    addWine,
    updateWine,
    deleteWine,
  };
}
```

### 2. Create `src/hooks/useWineLibrary.ts`

**Purpose**: Manage user's complete wine library

```typescript
export function useWineLibrary() {
  const { user } = useAuth();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWines = async () => {
    // Fetch wines created by user OR in their spaces
    const { data } = await supabase
      .from('wines')
      .select('*, bottle_instances(count), consumptions(count)')
      .order('created_at', { ascending: false });

    setWines(data || []);
  };

  const getWineUsage = (wineId: string) => {
    // Return: { instanceCount, consumptionCount, spaces }
  };

  return { wines, loading, fetchWines, getWineUsage };
}
```

## Modified User Flows

### Flow 1: Adding a New Bottle (First Time)

1. User clicks empty slot
2. Modal opens: "Add New Wine" is selected by default
3. User fills form (winery, name, year, etc.)
4. Click "Add Bottle"
5. Creates wine record + bottle instance

### Flow 2: Adding Same Wine Again

1. User clicks empty slot in different space
2. Modal opens: Toggle to "Use Existing Wine"
3. Dropdown shows existing wines
4. User searches "Caymus" → finds "Caymus Cabernet 2019"
5. Click "Add Bottle"
6. Creates bottle instance only (reuses wine)

### Flow 3: Editing Wine Details

1. User clicks bottle in grid
2. `BottleDetailModal` opens
3. Click wine name → opens `WineDetailModal`
4. Click "Edit Details"
5. Update price/score/notes
6. Changes reflect in ALL instances across all spaces

### Flow 4: Finding Duplicate Wines

1. User opens Wine Library (new page)
2. Click "Find Duplicates"
3. Tool shows potential matches
4. User selects duplicates to merge
5. Choose primary wine
6. Click "Merge" → consolidates data

## Utility Functions

### Add to `src/lib/utils.ts`

```typescript
export function normalizeWineName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function findPotentialDuplicates(wines: Wine[]): Wine[][] {
  const groups = new Map<string, Wine[]>();

  wines.forEach((wine) => {
    const key = `${normalizeWineName(wine.winery)}-${normalizeWineName(wine.name)}-${wine.year}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(wine);
  });

  return Array.from(groups.values()).filter((group) => group.length > 1);
}

export function calculateWineStats(
  wine: Wine,
  instances: BottleInstance[],
  consumptions: Consumption[]
) {
  return {
    currentBottles: instances.length,
    totalConsumed: consumptions.length,
    spaces: [...new Set(instances.map((i) => i.space_id))],
    averageRating: calculateAverageRating(consumptions),
  };
}
```

## Implementation Steps

### Phase 1: Add Existing Wine Option (MVP) ✅ COMPLETED

1. ✅ Modified `AddBottleModal` to support two modes (select/create)
2. ✅ Added real-time wine search with debouncing
3. ✅ Integrated `useWines` hook's `searchWines` function
4. ✅ Updated `onSubmit` handler to accept wine ID or NewWine
5. ✅ Modified `page.tsx` `handleAddBottle` to handle both flows

**Implementation Details:**

- Two-tab interface: "Select Existing" (default) and "Create New"
- Search activates after 2 characters with 300ms debounce
- Search results show winery, name, year, type, and price
- Visual selection with border highlight
- Falls back to create mode when no results found

### Phase 2: Wine Detail View

1. Create `WineDetailModal` component
2. Make wine names clickable in `BottleDetailModal`
3. Fetch wine details (instances + consumptions)
4. Show all occurrences across spaces
5. Enable editing wine metadata

### Phase 3: Wine Library Page

1. Create `/wines` page
2. List all wines with usage stats
3. Search and filter functionality
4. Click wine → open `WineDetailModal`
5. Quick actions: Edit, Delete, Add Another

### Phase 4: Deduplication Tool

1. Create `WineDeduplicationTool` component
2. Implement duplicate detection algorithm
3. Add "Find Duplicates" button to Wine Library
4. Implement merge functionality
5. Show success message with stats

## Edge Cases & Considerations

1. **No Existing Wines**: Hide "Use Existing Wine" option for first-time users
2. **Partial Matches**: Fuzzy search for wine names (typos, abbreviations)
3. **Editing Shared Wines**: Only creator can edit wine metadata
4. **Deleting Wines**: Can't delete if instances or consumptions exist
5. **Performance**: Lazy load wines (pagination if > 100 wines)

## Testing Strategy

### Unit Tests

- `normalizeWineName` function
- `findPotentialDuplicates` algorithm
- `calculateWineStats` function

### Component Tests

- `WineSelector` filters correctly
- `AddBottleModal` switches between modes
- `WineDetailModal` shows all instances

### Integration Tests

- Add existing wine → creates instance only
- Edit wine → updates all references
- Merge wines → consolidates data correctly

## UI/UX Considerations

1. **Default Mode**: Start with "Use Existing Wine" if user has > 5 wines
2. **Search Performance**: Debounce search input (300ms)
3. **Empty States**: "No wines found. Try adding a new wine."
4. **Visual Indicators**: Show badge "2 bottles" on wines with multiple instances
5. **Confirmation**: Warn before merging wines (irreversible)
6. **Success Messages**: "Wine updated! Changes reflected in 3 bottles."

## Future Enhancements (Out of Scope)

- OCR/camera scanning to auto-detect wine from label
- Wine API integration (fetch price/score from Vivino/Wine-Searcher)
- Wine recommendations based on library
- Export wine library (CSV/JSON)
- Share wine recommendations with collaborators

## Success Metrics

- Users reuse existing wines instead of creating duplicates
- Wine library grows slower than bottle instance count
- Users actively merge duplicate wines
- Wine detail view shows cross-space usage
- Single source of truth for wine metadata
