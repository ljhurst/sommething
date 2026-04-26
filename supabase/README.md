# Supabase Setup

## Quick Start

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Run migrations in order (see below)
4. Enable authentication (see Authentication Setup below)
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
2. `002_update_to_24_bottles.sql` - Update to 24-bottle capacity
3. `003_make_price_optional.sql` - Make price field optional
4. `004_make_consumption_price_optional.sql` - Make consumption price optional
5. `005_add_user_auth.sql` - Add user authentication (user_id columns and RLS policies)

**To run migrations**: Go to SQL Editor in Supabase dashboard, copy/paste each migration file, and run in order.

## Authentication Setup

Authentication is **required** as of migration `005_add_user_auth.sql`.

### Enable Auth in Supabase Dashboard

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure Site URL and Redirect URLs
4. Run `005_add_user_auth.sql` migration

**See detailed setup guide**: [`docs/setup/SUPABASE_AUTH_SETUP.md`](../../docs/setup/SUPABASE_AUTH_SETUP.md)

## Row Level Security (RLS)

RLS policies enforce user data isolation:

- Users can only see and modify their own bottles
- Users can only see their own consumption history
- Policies automatically filter by `auth.uid()`

**Note**: If you need to temporarily disable RLS for testing, you can do so in Supabase Dashboard under **Database** → **Tables** → Select table → **RLS is enabled** toggle (not recommended for production).

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
