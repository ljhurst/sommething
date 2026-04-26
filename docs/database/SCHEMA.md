# Database Schema

## Overview

The database uses a **normalized relational schema** that separates wine vintages from physical bottle instances, enabling wine data reuse and multi-user collaboration through shared spaces.

## Schema Diagram

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │
       ├─────────────────┬──────────────────┬─────────────────┐
       │                 │                  │                 │
       ▼                 ▼                  ▼                 ▼
┌──────────┐      ┌────────────┐    ┌──────────┐     ┌──────────────┐
│  wines   │      │   spaces   │    │consumptions│   │space_members │
└────┬─────┘      └──────┬─────┘    └─────┬────┘     └──────┬───────┘
     │                   │                 │                 │
     │            ┌──────┴──────┐          │                 │
     │            │             │          │                 │
     ▼            ▼             ▼          ▼                 ▼
┌────────────────────────────────┐  ┌──────────────────────────┐
│     bottle_instances           │  │   (space access check)   │
└────────────────────────────────┘  └──────────────────────────┘
```

## Tables

### wines

**Purpose**: Canonical wine vintage metadata (winery, name, year)

| Column             | Type        | Description                          |
| ------------------ | ----------- | ------------------------------------ |
| id                 | UUID (PK)   | Unique identifier                    |
| created_by_user_id | UUID (FK)   | User who added this wine             |
| winery             | TEXT        | Winery name                          |
| name               | TEXT        | Wine name                            |
| type               | wine_type   | red, white, rose, sparkling, dessert |
| year               | INTEGER     | Vintage year (1900-2100)             |
| price              | DECIMAL     | Price (optional)                     |
| score              | INTEGER     | Score 0-100 (optional)               |
| notes              | TEXT        | Tasting notes (optional)             |
| created_at         | TIMESTAMPTZ | When created                         |
| updated_at         | TIMESTAMPTZ | When last updated                    |

**Key Feature**: When a wine is updated, all bottle_instances and consumptions reference the updated data.

### spaces

**Purpose**: Storage locations (fridges, cellars, racks)

| Column        | Type        | Description                         |
| ------------- | ----------- | ----------------------------------- |
| id            | UUID (PK)   | Unique identifier                   |
| owner_user_id | UUID (FK)   | Space owner                         |
| name          | TEXT        | Space name (e.g., "My Wine Fridge") |
| description   | TEXT        | Optional description                |
| rows          | INTEGER     | Grid height (1-100)                 |
| columns       | INTEGER     | Grid width (1-100)                  |
| space_type    | TEXT        | fridge, cellar, rack                |
| created_at    | TIMESTAMPTZ | When created                        |
| updated_at    | TIMESTAMPTZ | When last updated                   |

**Capacity**: `rows × columns` determines total slots

### space_members

**Purpose**: User collaboration and sharing

| Column    | Type        | Description           |
| --------- | ----------- | --------------------- |
| id        | UUID (PK)   | Unique identifier     |
| space_id  | UUID (FK)   | Space being shared    |
| user_id   | UUID (FK)   | User with access      |
| role      | TEXT        | owner, editor, viewer |
| joined_at | TIMESTAMPTZ | When added to space   |

**Unique**: (space_id, user_id) - one membership per user per space

### bottle_instances

**Purpose**: Physical bottles in specific spaces

| Column        | Type        | Description                         |
| ------------- | ----------- | ----------------------------------- |
| id            | UUID (PK)   | Unique identifier                   |
| wine_id       | UUID (FK)   | Wine vintage this bottle represents |
| space_id      | UUID (FK)   | Where this bottle is stored         |
| slot_position | INTEGER     | Position in space grid              |
| added_at      | TIMESTAMPTZ | When added to space                 |

**Unique**: (space_id, slot_position) - one bottle per slot

### consumptions

**Purpose**: Historical record of consumed wines

| Column              | Type        | Description                       |
| ------------------- | ----------- | --------------------------------- |
| id                  | UUID (PK)   | Unique identifier                 |
| wine_id             | UUID (FK)   | Wine that was consumed            |
| consumed_by_user_id | UUID (FK)   | Who drank it                      |
| space_id            | UUID (FK)   | Where it was stored               |
| consumed_at         | TIMESTAMPTZ | When consumed                     |
| notes               | TEXT        | Tasting notes (optional)          |
| rating              | rating_type | thumbs_up, thumbs_down (optional) |

## Row Level Security (RLS) Policies

All tables have RLS enabled. Key principles:

### Policy Design: Avoiding Recursion

**Critical**: Policies must avoid circular dependencies to prevent infinite recursion errors.

**Safe Order**:

1. `spaces` - checks only ownership (`owner_user_id = auth.uid()`)
2. `space_members` - checks `spaces` ownership OR self (`user_id = auth.uid()`)
3. Other tables - can safely query `space_members`

### spaces

- **SELECT**: Users see spaces they own
- **INSERT**: Users can create their own spaces
- **UPDATE/DELETE**: Only space owners

### space_members

- **SELECT**: See own membership records OR members of spaces you own
- **INSERT/UPDATE/DELETE**: Only space owners can manage members (except users can leave)

### wines

- **SELECT**: See wines you created OR wines in spaces you're a member of
- **INSERT**: Anyone can create wines
- **UPDATE/DELETE**: Only wine creator

### bottle_instances

- **SELECT**: See bottles in spaces you're a member of
- **INSERT/UPDATE/DELETE**: Only members with 'owner' or 'editor' role

### consumptions

- **SELECT**: See consumptions from spaces you're a member of
- **INSERT**: Record consumptions in spaces where you're an owner/editor
- **UPDATE/DELETE**: Only your own consumption records

## Migration Path

### From Old Schema (bottles, consumption_history)

The migration process (migrations 007-016):

1. **007**: Create new normalized tables
2. **008**: Migrate data (creates default space per user, deduplicates wines)
3. **010**: Drop old tables
4. **012**: Ensure all users have a default space
5. **013**: Trigger to auto-create space for new users
6. **016**: Working RLS policies (no recursion)

### Data Transformation

**Old `bottles` table** →

- `wines`: Deduplicated by (winery, name, year) per user
- `bottle_instances`: One per original bottle, linked to wine + default space

**Old `consumption_history`** →

- `wines`: Create wines if not already present
- `consumptions`: Linked to wine + default space

## Usage Examples

### Query bottles with wine data

```typescript
const { data } = await supabase
  .from('bottle_instances')
  .select(
    `
    *,
    wine:wines(*)
  `
  )
  .eq('space_id', spaceId);
```

### Add a new bottle

```typescript
// 1. Create or find wine
const wine = await supabase
  .from('wines')
  .insert({ winery, name, type, year, ... })
  .select()
  .single();

// 2. Create bottle instance
const bottle = await supabase
  .from('bottle_instances')
  .insert({
    wine_id: wine.id,
    space_id: spaceId,
    slot_position: 5
  });
```

### Share a space

```typescript
await supabase.from('space_members').insert({
  space_id: spaceId,
  user_id: collaboratorUserId,
  role: 'editor',
});
```

## Benefits of Normalized Schema

1. **Wine Data Reuse**: Update wine once, reflects everywhere
2. **Multi-User**: Spaces can be shared with collaborators
3. **Flexible Storage**: Support multiple spaces per user (multiple fridges, cellars)
4. **Clean History**: Consumptions track which wine from which space
5. **Scalable**: Easy to add features like wine ratings, collections, wishlists
