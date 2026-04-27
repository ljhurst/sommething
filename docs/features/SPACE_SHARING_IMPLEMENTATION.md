# Space Sharing Feature

## Overview

Sommething supports multi-user collaboration on wine spaces with role-based access control. Space owners can invite members via email, assign roles (editor/viewer), and manage permissions.

## Features

### Role-Based Access

- **Owner**: Full control - manage members, add/edit/delete bottles, share space
- **Editor**: Can add and edit bottles, cannot manage members
- **Viewer**: Read-only access, cannot modify anything

### Share Space Modal

Located in `src/components/ShareSpaceModal.tsx`, accessible via "Share" button on:

- Main page header (for current space owner)
- Spaces page (for each space you own)

**Features**:

- View all space members with their roles
- Invite new members by email
- Change member roles (editor ↔ viewer)
- Remove members from space
- Shows "Added by [email]" attribution for owner

### Bottle Attribution

All bottles show who added them:

- Displayed in `BottleDetailModal` as "Added by [email]"
- Tracked via `added_by_user_id` column in `bottle_instances` table
- Automatically set to current user when adding bottles

### Permission Enforcement

**Client-Side**:

- Empty slots: Viewers cannot click to add bottles
- Bottle actions: Edit/consume buttons hidden for viewers
- Share button: Only visible to space owners

**Server-Side**:

- RLS policies enforce all permissions in database
- Safe against client-side tampering

## Technical Implementation

### Database Schema

#### Tables

```sql
-- Spaces track ownership
spaces (
  id UUID PRIMARY KEY,
  owner_user_id UUID REFERENCES auth.users(id),
  name TEXT,
  ...
)

-- Members define who can access spaces
space_members (
  id UUID PRIMARY KEY,
  space_id UUID REFERENCES spaces(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ,
  UNIQUE(space_id, user_id)
)

-- Bottles track who added them
bottle_instances (
  id UUID PRIMARY KEY,
  wine_id UUID REFERENCES wines(id),
  space_id UUID REFERENCES spaces(id),
  slot_position INTEGER,
  added_by_user_id UUID REFERENCES auth.users(id),
  added_at TIMESTAMPTZ
)
```

#### RLS Policies

See `supabase/migrations/016_comprehensive_rls_fix_no_recursion.sql` for comprehensive RLS policies.

Key policies:

- Users can view spaces they own OR are members of
- Only owners can manage space_members
- Editors and owners can add/delete bottles
- Viewers can only read data

### Security Functions

To avoid RLS recursion and access `auth.users` data securely, we use `SECURITY DEFINER` functions:

```sql
-- Get user email by ID (migration 019)
get_user_email(user_id UUID) RETURNS TEXT

-- Get user ID by email (migration 019)
get_user_id_by_email(user_email TEXT) RETURNS UUID

-- Check space membership without triggering RLS (migration 021)
is_space_member(space_id UUID, user_id UUID) RETURNS BOOLEAN
```

### Key Components

#### ShareSpaceModal (`src/components/ShareSpaceModal.tsx`)

- Manages space member list
- Invite form with email + role selection
- Member management (change role, remove)

#### BottleDetailModal (`src/components/BottleDetailModal.tsx`)

- Shows bottle attribution
- Conditionally renders action buttons based on user role

#### Main Page (`src/app/page.tsx`)

- Determines user role via `useEffect` checking owner or `space_members`
- Passes `userRole` to `BottleDetailModal`
- Disables empty slot clicks for viewers

### Custom Hooks

#### useSpaces (`src/hooks/useSpaces.ts`)

New functions for space sharing:

```typescript
// Fetch members with email lookup
getSpaceMembers(spaceId: string): Promise<SpaceMember[]>

// Invite member by email
inviteMemberByEmail(
  spaceId: string,
  email: string,
  role: 'editor' | 'viewer'
): Promise<{ success: boolean; error?: string }>

// Update member role
updateSpaceMember(
  memberId: string,
  role: 'owner' | 'editor' | 'viewer'
): Promise<boolean>

// Remove member
removeSpaceMember(memberId: string): Promise<boolean>
```

#### useBottles (`src/hooks/useBottles.ts`)

Enhanced to fetch and set attribution:

- `fetchBottles()` enriches results with `added_by: { id, email }`
- `addBottle()` automatically sets `added_by_user_id` to current user

### Data Flow

1. **Loading Members**:
   - `ShareSpaceModal` calls `getSpaceMembers(spaceId)`
   - Hook fetches from `space_members` table
   - For each member, calls `get_user_email()` RPC function
   - Returns `SpaceMember[]` with user email

2. **Inviting Members**:
   - User enters email in `ShareSpaceModal`
   - Calls `inviteMemberByEmail(spaceId, email, role)`
   - Hook calls `get_user_id_by_email()` RPC function
   - Inserts into `space_members` table
   - RLS ensures only owners can add members

3. **Determining User Role**:
   - Main page checks if `user.id === space.owner_user_id` → owner
   - Otherwise, calls `getSpaceMembers()` and finds current user → their role
   - Defaults to viewer if not found

## Migrations

- **017**: Fixed spaces SELECT policy to include shared spaces
- **018**: Added `added_by_user_id` to bottle_instances, backfilled with owners
- **019**: Created `get_user_email()` and `get_user_id_by_email()` functions
- **020**: Auto-add space owner to space_members on space creation
- **021**: Fixed infinite recursion in spaces RLS using `is_space_member()` function

## Known Limitations

- No email notifications when invited (future enhancement)
- No activity feed showing member actions (future enhancement)
- Owner cannot transfer ownership (future enhancement)
- No member limit enforced (consider adding for resource management)

## Testing

All 125 unit tests pass, including:

- Mock RPC calls in hook tests
- Attribution field in all `BottleInstance` mocks
- Permission checks in component tests

## Future Enhancements

1. **Email Invitations**: Send email when invited to space
2. **Activity Feed**: Show who added/consumed bottles with timestamps
3. **Member Analytics**: Per-member consumption statistics
4. **Leave Space**: Allow non-owners to leave spaces
5. **Owner Transfer**: Allow owner to transfer ownership to another member
