# Priority 3: Space Collaboration UI

## Overview

Enable users to share spaces with household members or collaborators. The database schema supports multi-user spaces with role-based access (owner/editor/viewer), but there's currently NO UI to invite members or manage sharing.

## Problem Statement

**Current State**:

- `space_members` table exists with role-based access
- RLS policies enforce permissions correctly
- Users can't invite anyone (no UI)
- Users can't see who has access to their spaces

**Desired State**:

- Space owners can invite collaborators via email
- Members see shared spaces in their space list
- Activity feed shows who added/consumed what
- Analytics show per-member insights

## Goals

1. Invite members to spaces (owner only)
2. Assign roles: owner, editor (add/remove bottles), viewer (read-only)
3. Show member list with roles
4. Display attribution: "Added by Sarah", "Consumed by John"
5. Remove members or leave spaces
6. Activity feed showing member actions

## Database Schema (Already Exists)

```sql
-- space_members table
id UUID
space_id UUID (FK to spaces)
user_id UUID (FK to auth.users)
role TEXT (owner, editor, viewer)
joined_at TIMESTAMPTZ
UNIQUE(space_id, user_id)

-- RLS policies already enforce:
-- - Owners can manage members
-- - Editors can add/remove bottles
-- - Viewers can only read
```

**Note**: The schema doesn't store emails, only user IDs. We'll need to:

1. Look up user by email (Supabase Auth)
2. Create space_member record with their user_id

## UI Components to Create

### 1. ShareSpaceModal Component (`src/components/ShareSpaceModal.tsx`)

**Purpose**: Invite members and manage access

**Props**:

```typescript
interface ShareSpaceModalProps {
  isOpen: boolean;
  space: Space;
  members: SpaceMember[]; // with user details joined
  onClose: () => void;
  onInvite: (email: string, role: 'editor' | 'viewer') => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
  onUpdateRole: (memberId: string, role: 'editor' | 'viewer') => Promise<void>;
}
```

**Sections**:

**A. Member List**:

```
┌─────────────────────────────────────┐
│ MEMBERS (3)                         │
├─────────────────────────────────────┤
│ 👑 you@email.com (Owner)            │
│    Joined Mar 15, 2026              │
├─────────────────────────────────────┤
│ 🖊️ sarah@email.com (Editor)         │
│    Joined Apr 1, 2026               │
│    [Change Role ▼] [Remove]        │
├─────────────────────────────────────┤
│ 👁️ john@email.com (Viewer)          │
│    Joined Apr 10, 2026              │
│    [Change Role ▼] [Remove]        │
└─────────────────────────────────────┘
```

**B. Invite Form**:

```
┌─────────────────────────────────────┐
│ INVITE MEMBER                       │
├─────────────────────────────────────┤
│ Email: [________________]           │
│                                     │
│ Role: ( ) Editor  (•) Viewer       │
│                                     │
│ ℹ️ Editor: Can add and remove bottles │
│    Viewer: Can only view collection │
│                                     │
│ [Send Invite]                       │
└─────────────────────────────────────┘
```

**Features**:

- Search existing members
- Change member roles (dropdown)
- Remove members (with confirmation)
- Invite by email (validates Supabase user exists)
- Role descriptions (tooltip/info)
- Copy shareable link (future: public/guest access)

**Validation**:

- Email must be valid
- User must have Supabase account (or show "User not found")
- Can't invite existing member
- Can't remove yourself if you're the only owner

### 2. SpaceMemberBadge Component (`src/components/SpaceMemberBadge.tsx`)

**Purpose**: Small badge showing member info

**Props**:

```typescript
interface SpaceMemberBadgeProps {
  userId: string;
  userName?: string;
  role: 'owner' | 'editor' | 'viewer';
  size?: 'sm' | 'md' | 'lg';
}
```

**Visual**:

```
[👑 Sarah] (Owner)
[🖊️ John] (Editor)
[👁️ Guest] (Viewer)
```

### 3. ActivityFeed Component (`src/components/ActivityFeed.tsx`)

**Purpose**: Timeline of space activity

**Props**:

```typescript
interface ActivityFeedProps {
  spaceId: string;
  limit?: number;
}
```

**Activity Types**:

- Bottle added: "Sarah added Caymus Cabernet 2019 to slot 12"
- Bottle removed: "John removed bottle from slot 5"
- Bottle consumed: "Sarah consumed Stag's Leap Merlot 2020"
- Wine rated: "John gave 👍 to Caymus Cabernet 2019"
- Member joined: "Alex joined Kitchen Fridge as Editor"

**Visual Design**:

```
┌─────────────────────────────────────┐
│ ACTIVITY                            │
├─────────────────────────────────────┤
│ 🍷 Sarah added Caymus Cab 2019      │
│    to slot 12 · 2 hours ago         │
├─────────────────────────────────────┤
│ 🥂 John consumed Stag's Leap 2020   │
│    👍 "Great with dinner"           │
│    from slot 5 · 1 day ago          │
├─────────────────────────────────────┤
│ 👥 Alex joined Kitchen Fridge       │
│    as Editor · 3 days ago           │
└─────────────────────────────────────┘
```

**Data Source**:

- Query `bottle_instances` (created by user_id)
- Query `consumptions` (consumed_by_user_id)
- Query `space_members` (joined_at)
- Combine and sort by timestamp

### 4. MemberInsights Component (`src/components/MemberInsights.tsx`)

**Purpose**: Analytics per member in shared space

**Props**:

```typescript
interface MemberInsightsProps {
  spaceId: string;
  members: SpaceMember[];
}
```

**Metrics per Member**:

- Bottles added (count)
- Bottles consumed (count)
- Favorite wine type (from consumptions)
- Average rating (thumbs up/down ratio)
- Most consumed winery

**Visual Design**:

```
┌─────────────────────────────────────┐
│ MEMBER INSIGHTS                     │
├─────────────────────────────────────┤
│ Sarah                               │
│ · Added 12 bottles                  │
│ · Consumed 8 bottles                │
│ · Prefers: Red wines (75%)          │
│ · Rating: 7/8 👍 (87%)              │
├─────────────────────────────────────┤
│ John                                │
│ · Added 5 bottles                   │
│ · Consumed 3 bottles                │
│ · Prefers: White wines (67%)        │
│ · Rating: 2/3 👍 (67%)              │
└─────────────────────────────────────┘
```

### 5. Modify Existing Components

#### `BottleDetailModal.tsx`

**Add**:

- "Added by [Name]" (show who added the bottle)
- If member has permission, show edit/delete actions
- If viewer, hide action buttons

#### `BottleSlot.tsx`

**Add**:

- Tiny badge showing who added the bottle (optional, on hover)

#### `AddBottleModal.tsx`

**Add**:

- Attribution: "Adding as [Your Name]"

#### Analytics Page (`src/app/analytics/page.tsx`)

**Add**:

- Toggle: "My Activity" vs "All Members"
- Show member breakdown if shared space

#### Header (`src/app/page.tsx`)

**Add**:

- Share button (👥 icon) next to space switcher
- Badge showing member count: "👥 3"

## Hooks to Create/Modify

### 1. Create `src/hooks/useSpaceMembers.ts`

**Purpose**: Manage space membership

```typescript
export function useSpaceMembers(spaceId: string) {
  const [members, setMembers] = useState<SpaceMemberWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('space_members')
      .select(
        `
        *,
        user:auth.users(id, email)
      `
      )
      .eq('space_id', spaceId);

    setMembers(data || []);
  };

  const inviteMember = async (email: string, role: 'editor' | 'viewer') => {
    // 1. Look up user by email in auth.users
    // 2. Create space_member record
    // 3. Optional: Send email notification (future)
  };

  const removeMember = async (memberId: string) => {
    await supabase.from('space_members').delete().eq('id', memberId);
    await fetchMembers();
  };

  const updateMemberRole = async (memberId: string, role: 'editor' | 'viewer') => {
    await supabase.from('space_members').update({ role }).eq('id', memberId);
    await fetchMembers();
  };

  const leaveSpace = async () => {
    // User removes themselves (unless they're the only owner)
  };

  useEffect(() => {
    fetchMembers();
  }, [spaceId]);

  return {
    members,
    loading,
    inviteMember,
    removeMember,
    updateMemberRole,
    leaveSpace,
    refetch: fetchMembers,
  };
}
```

### 2. Create `src/hooks/useSpaceActivity.ts`

**Purpose**: Fetch activity timeline

```typescript
interface Activity {
  id: string;
  type: 'bottle_added' | 'bottle_consumed' | 'member_joined';
  userId: string;
  userName: string;
  timestamp: string;
  details: any; // wine, slot, notes, etc.
}

export function useSpaceActivity(spaceId: string, limit = 20) {
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchActivity = async () => {
    // Fetch recent bottle_instances (added)
    const bottles = await supabase
      .from('bottle_instances')
      .select('*, wine:wines(*), user:auth.users!created_by_user_id(email)')
      .eq('space_id', spaceId)
      .order('added_at', { ascending: false })
      .limit(limit);

    // Fetch recent consumptions
    const consumptions = await supabase
      .from('consumptions')
      .select('*, wine:wines(*), user:auth.users!consumed_by_user_id(email)')
      .eq('space_id', spaceId)
      .order('consumed_at', { ascending: false })
      .limit(limit);

    // Fetch recent member joins
    const members = await supabase
      .from('space_members')
      .select('*, user:auth.users(email)')
      .eq('space_id', spaceId)
      .order('joined_at', { ascending: false })
      .limit(limit);

    // Combine and sort by timestamp
    const combined = [
      ...bottles.map((b) => ({
        type: 'bottle_added',
        userId: b.user.id,
        userName: b.user.email,
        timestamp: b.added_at,
        details: { wine: b.wine, slot: b.slot_position },
      })),
      // ... similar for consumptions and members
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setActivities(combined);
  };

  useEffect(() => {
    fetchActivity();
  }, [spaceId]);

  return { activities, loading, refetch: fetchActivity };
}
```

### 3. Modify `src/hooks/useBottles.ts`

**Add attribution**:

```typescript
// When fetching bottles, include user info
const { data } = await supabase
  .from('bottle_instances')
  .select(
    `
    *,
    wine:wines(*),
    added_by:auth.users!added_by_user_id(id, email)  // NEW
  `
  )
  .eq('space_id', spaceId);
```

**Note**: May need to add `added_by_user_id` column to `bottle_instances` table via migration.

## Database Migrations Needed

### Migration: Add Attribution to Bottle Instances

```sql
-- Add added_by_user_id to track who added each bottle
ALTER TABLE bottle_instances
ADD COLUMN added_by_user_id UUID REFERENCES auth.users(id);

-- Backfill existing bottles with space owner
UPDATE bottle_instances bi
SET added_by_user_id = s.owner_user_id
FROM spaces s
WHERE bi.space_id = s.id
AND bi.added_by_user_id IS NULL;

-- Make it required going forward
ALTER TABLE bottle_instances
ALTER COLUMN added_by_user_id SET NOT NULL;

-- Add index for performance
CREATE INDEX idx_bottle_instances_added_by ON bottle_instances(added_by_user_id);
```

### Migration: Add User Email Lookup Function

```sql
-- Function to look up user by email
CREATE OR REPLACE FUNCTION get_user_id_by_email(email_address TEXT)
RETURNS UUID AS $$
  SELECT id FROM auth.users WHERE email = email_address LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;
```

## User Flows

### Flow 1: Invite a Member

1. Owner opens space switcher → clicks "Share" button
2. `ShareSpaceModal` opens showing current members
3. Owner enters collaborator's email + selects role (Editor)
4. System checks if user exists in Supabase Auth
5. Creates `space_member` record
6. Collaborator now sees space in their space list
7. Success toast: "Sarah (sarah@email.com) invited as Editor"

### Flow 2: View Shared Space (Collaborator)

1. Sarah logs in
2. Space switcher shows "Kitchen Fridge (shared)"
3. Sarah selects space → sees all bottles
4. Sarah adds a bottle → attributed to Sarah
5. John (owner) sees "Sarah added Caymus Cabernet 2019"

### Flow 3: Change Member Role

1. Owner opens `ShareSpaceModal`
2. Clicks dropdown next to member: "Editor" → "Viewer"
3. Confirmation: "Change John's role to Viewer?"
4. Updates role → John can now only view, not edit

### Flow 4: Remove Member

1. Owner opens `ShareSpaceModal`
2. Clicks "Remove" next to member
3. Confirmation: "Remove Sarah from Kitchen Fridge?"
4. Deletes `space_member` record
5. Sarah no longer sees space in their list

### Flow 5: Leave Shared Space

1. Member opens `ShareSpaceModal`
2. Clicks "Leave Space" button
3. Confirmation: "Leave Kitchen Fridge?"
4. Deletes own `space_member` record
5. Space removed from member's list

## Edge Cases & Considerations

1. **User Not Found**: "No user found with this email. They need to create an account first."
2. **Last Owner**: Can't remove yourself if you're the only owner
3. **Role Permissions**: Viewers see "You don't have permission to add bottles"
4. **Conflicting Edits**: Two editors add bottle to same slot → database constraint prevents (unique slot_position)
5. **Member Limit**: Warn if > 10 members (performance concern)
6. **Email Notifications**: Future enhancement (not in MVP)

## Testing Strategy

### Unit Tests

- `inviteMember` validates email format
- `removeMember` prevents removing last owner
- `updateMemberRole` only allows owner/editor/viewer

### Component Tests

- `ShareSpaceModal` renders member list
- `ShareSpaceModal` validates invite form
- `ActivityFeed` sorts chronologically

### Integration Tests

- Invite member → they see space
- Remove member → they lose access
- Viewer can't add bottles (RLS blocks)

## UI/UX Considerations

1. **Space Badge**: Show "👥 Shared" badge on shared spaces in switcher
2. **Attribution**: Always show "Added by [Name]" in bottle details
3. **Permissions UI**: Disable buttons for viewers with tooltip explanation
4. **Activity Feed**: Show on space page or as separate tab
5. **Member Colors**: Assign color to each member (for visual distinction)
6. **Onboarding**: "Invite household members to collaborate!"

## Security Considerations

1. **RLS Enforcement**: All permissions enforced at database level
2. **Email Lookup**: Use `SECURITY DEFINER` function carefully
3. **Rate Limiting**: Prevent invite spam (future: max 10 invites/day)
4. **Public Sharing**: Don't expose space publicly (require auth)

## Future Enhancements (Out of Scope)

- Email notifications on invite
- Shareable public links (view-only, no login)
- Comments on bottles (member discussions)
- Member preferences (hide certain bottles, favorites)
- Space transfer (change owner)
- Bulk member operations (invite via CSV)
- Integration with contacts (suggest members)

## Success Metrics

- Users invite household members
- Shared spaces have > 1 active member
- Activity feed shows collaborative actions
- Members use role-based permissions correctly
- No RLS policy violations (proper access control)
