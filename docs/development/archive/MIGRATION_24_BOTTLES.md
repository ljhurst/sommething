# Migration: 30 Bottles → 24 Bottles (4×6 Grid)

## Overview

Updated the wine fridge configuration from 30 bottles (5×6 or 6×5 grid) to 24 bottles (4 wide × 6 tall) to match your actual wine fridge dimensions.

## Changes Made

### 1. Database Schema

- **File**: `supabase/migrations/001_initial_schema.sql`
- **Change**: Updated slot_position constraint from `<= 30` to `<= 24`
- **New Migration**: Created `002_update_to_24_bottles.sql` for existing databases

### 2. Core Logic

- **File**: `src/lib/utils.ts`
  - Updated `getAvailableSlots()` to generate 24 slots instead of 30

- **File**: `src/app/page.tsx`
  - Updated capacity constant from 30 to 24

### 3. UI Components

- **File**: `src/components/WineFridgeGrid.tsx`
  - Changed slot count from 30 to 24
  - Updated grid layout from `grid-cols-5 md:grid-cols-6` to `grid-cols-4` (4 columns on all screens)

- **File**: `src/components/WineFridge3D.tsx`
  - Updated `getBottlePosition()` calculation for 4×6 grid layout
  - Changed row calculation from `/ 6` to `/ 4`
  - Changed column calculation from `% 6` to `% 4`
  - Adjusted x-axis centering from `col - 2.5` to `col - 1.5` (4 columns)
  - Adjusted y-axis positioning from `2 - row` to `2.5 - row` (6 rows)

### 4. Tests

- **File**: `tests/lib/utils.test.ts`
  - Updated expected slot count from 30 to 24
  - Updated available slots test from 28 to 22 (when 2 bottles occupied)
  - All 30 tests pass ✅

### 5. Documentation

- **README.md**: Updated all references to 30 bottles → 24 bottles, grid dimensions
- **VISION.md**: Updated grid layout description (5×6/6×5 → 4×6)
- **PROJECT_SUMMARY.md**: Updated feature descriptions
- **SETUP.md**: Added migration note for existing databases

## Grid Layout

### Before (30 bottles)

- Mobile: 5 columns × 6 rows
- Desktop: 6 columns × 5 rows

### After (24 bottles)

- All screens: 4 columns × 6 rows
- Consistent layout across devices

## Slot Numbering

Slots are numbered 1-24, left to right, top to bottom:

```
Row 1: [1]  [2]  [3]  [4]
Row 2: [5]  [6]  [7]  [8]
Row 3: [9]  [10] [11] [12]
Row 4: [13] [14] [15] [16]
Row 5: [17] [18] [19] [20]
Row 6: [21] [22] [23] [24]
```

## Migration Steps for Existing Users

If you already have a Supabase database with bottles:

1. **Check for bottles in slots 25-30**:

   ```sql
   SELECT * FROM bottles WHERE slot_position > 24;
   ```

2. **If you have bottles in those slots**, either:
   - Manually relocate them to slots 1-24 in the UI, OR
   - Delete them:
     ```sql
     DELETE FROM bottles WHERE slot_position > 24;
     ```

3. **Run the migration**:
   - Go to Supabase SQL Editor
   - Copy contents of `supabase/migrations/002_update_to_24_bottles.sql`
   - Execute the migration

## Testing

All tests pass after migration:

- ✅ 4 type tests
- ✅ 10 utility tests (updated for 24 slots)
- ✅ 9 analytics tests
- ✅ 7 component tests
- **Total: 30/30 tests passing**

## Build Verification

- ✅ TypeScript compilation successful
- ✅ Production build successful
- ✅ No linting errors

## What Didn't Change

- Database structure (tables, columns, relationships)
- Component architecture
- Testing setup
- PWA configuration
- Analytics logic
- 3D visualization (just positioning adjusted)
- API calls and data fetching
- Type definitions

## Next Steps

1. If you have an existing deployment:
   - Run the migration SQL in your Supabase dashboard
   - Redeploy the application

2. For new deployments:
   - Just run `001_initial_schema.sql` (already updated)
   - No additional migration needed

3. Start fresh (recommended):
   - Create a new Supabase project
   - Run the updated schema
   - Import your bottles manually or start tracking

---

**Note**: This change maintains backward compatibility for the data model. Only the slot position constraint changed, so existing bottles with slot_position 1-24 will continue to work without any data migration.
