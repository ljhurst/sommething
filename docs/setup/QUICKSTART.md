# Quick Start Guide

Get your wine fridge tracker running in 5 minutes!

## 1. Install Dependencies (1 min)

```bash
npm install
```

## 2. Set Up Supabase (2 min)

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and wait for provisioning

### Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Copy contents from `supabase/migrations/001_initial_schema.sql`
3. Paste and click **Run**

### Get Your Credentials

1. Go to **Settings** > **API**
2. Copy:
   - Project URL
   - anon public key

## 3. Configure Environment (1 min)

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Start the App (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Add Your First Bottle!

1. Click any empty slot in the grid
2. Fill in bottle details
3. Click "Add Bottle"
4. See your collection come to life!

## What's Next?

- **View Analytics**: Click the "Analytics" button to see insights
- **3D View** (Desktop): Toggle between 2D grid and 3D visualization
- **Mark as Consumed**: Click a bottle → "Mark as Consumed"
- **PWA Install**: On mobile, add to home screen for app-like experience

## Need Help?

- Full setup guide: [SETUP.md](./SETUP.md)
- Product vision: [VISION.md](../product/VISION.md)
- Technical details: [README.md](../../README.md)

Enjoy! 🍷
