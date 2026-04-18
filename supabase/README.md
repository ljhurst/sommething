# Supabase Setup

## Quick Start

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Run the migration
5. Copy your project URL and anon key from Settings > API
6. Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

### Tables

**bottles**

- Primary storage for wine bottles in the fridge
- Each bottle occupies one slot (1-30)
- Slot positions are unique (enforced by database constraint)

**consumption_history**

- Records when bottles are consumed
- References bottles table via foreign key
- Preserves history even if bottle record is deleted (via cascade)

### Enums

**wine_type**: red, white, rose, sparkling, dessert, other
**rating_type**: thumbs_up, thumbs_down

## Migrations

Migrations are stored in `migrations/` directory and should be run in order:

1. `001_initial_schema.sql` - Initial database setup

## Row Level Security (RLS)

Currently configured for public access (no authentication required). To add authentication later:

1. Enable Supabase Auth
2. Update RLS policies to check `auth.uid()`
3. Add user_id column to bottles table

## Sample Data (Optional)

```sql
-- Add a test bottle
INSERT INTO bottles (winery, name, type, year, price, score, slot_position)
VALUES ('Château Margaux', 'Margaux', 'red', 2015, 450.00, 95, 1);

-- Mark it as consumed
INSERT INTO consumption_history (bottle_id, notes, rating)
VALUES (
  (SELECT id FROM bottles WHERE slot_position = 1),
  'Excellent with steak',
  'thumbs_up'
);
```
