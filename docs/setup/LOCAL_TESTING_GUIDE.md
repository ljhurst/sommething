# Local Testing Guide - Step by Step

Follow these steps to test Sommething locally on your machine.

## Prerequisites Check

First, verify you have everything installed:

```bash
node --version  # Should be 18 or higher
npm --version   # Should be 9 or higher
```

If you need to install Node.js, get it from [nodejs.org](https://nodejs.org)

---

## Step 1: Set Up Supabase Database (3 minutes)

### 1.1 Create Supabase Project

1. Open [supabase.com](https://supabase.com) in your browser
2. Click **"Start your project"** or **"New Project"**
3. Sign in with GitHub (or create a free account)
4. Click **"New Project"**
5. Fill in the form:
   - **Name**: `sommething` (or any name you like)
   - **Database Password**: Click "Generate a password" and save it somewhere
   - **Region**: Choose the one closest to you
   - **Pricing Plan**: Free (default)
6. Click **"Create new project"**
7. ☕ Wait 2-3 minutes while it provisions...

### 1.2 Run Database Migration

Once your project is ready:

1. In Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Open the file `supabase/migrations/001_initial_schema.sql` in this project
3. Copy ALL the contents (it's about 60 lines)
4. Paste into the SQL Editor in Supabase
5. Click **"Run"** (bottom right)
6. You should see: ✅ "Success. No rows returned"

### 1.3 Get Your API Credentials

1. In Supabase dashboard, click **"Settings"** (gear icon in left sidebar)
2. Click **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys" - it's a long string)
4. Keep this page open - you'll need these in the next step!

---

## Step 2: Configure Environment Variables (1 minute)

Now let's tell the app how to connect to your database:

1. In your terminal, navigate to the project folder:

   ```bash
   cd /Users/lhurs1/learning/sommething
   ```

2. Create the environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Open `.env.local` in your editor:

   ```bash
   # Use your favorite editor
   code .env.local        # VS Code
   # or
   nano .env.local        # Terminal editor
   # or
   open .env.local        # Default text editor
   ```

4. Replace the placeholder values with your actual Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-very-long-anon-key-here
   ```

5. Save and close the file

---

## Step 3: Start the Development Server (30 seconds)

```bash
# Make sure you're in the project directory
cd /Users/lhurs1/learning/sommething

# Start the dev server
npm run dev
```

You should see:

```
▲ Next.js 16.2.1 (Turbopack)
- Local:        http://localhost:3000
✓ Ready in 219ms
```

---

## Step 4: Test the App! 🍷

### Open in Browser

1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the wine fridge grid with 30 empty slots!

### Test 1: Add Your First Bottle

1. **Click any empty slot** (they have a "+" icon)
2. Fill in the form:
   - **Winery**: `Château Margaux`
   - **Wine Name**: `Margaux`
   - **Type**: Select `Red`
   - **Year**: `2015`
   - **Price**: `450`
   - **Score**: `95` (optional)
3. Click **"Add Bottle"**
4. 🎉 You should see a burgundy circle appear in that slot!

### Test 2: Add More Bottles

Try adding different wine types to see the colors:

**White Wine:**

- Winery: `Domaine Leflaive`
- Name: `Puligny-Montrachet`
- Type: `White`
- Year: `2020`
- Price: `85`

**Rosé:**

- Winery: `Château d'Esclans`
- Name: `Whispering Angel`
- Type: `Rosé`
- Year: `2022`
- Price: `25`

**Sparkling:**

- Winery: `Dom Pérignon`
- Name: `Champagne`
- Type: `Sparkling`
- Year: `2012`
- Price: `200`

You should now see different colored circles! 🔴⚪🌸🥂

### Test 3: View Bottle Details

1. **Click on any filled bottle** (the colored circles)
2. A modal should slide up showing:
   - Full bottle details
   - Winery name
   - Year, price, score
   - Slot position
3. Try the **"Previous"** and **"Next"** buttons to navigate between bottles
4. Click the X or outside the modal to close

### Test 4: Mark a Bottle as Consumed

1. Click on a bottle to open details
2. Click **"Mark as Consumed"**
3. You'll see options for:
   - 👍 Good / 👎 Not Great (optional)
   - Tasting notes (optional)
4. Click **"Confirm"**
5. The bottle disappears from the grid (it's now in history!)
6. The slot becomes empty again

### Test 5: Check Analytics

1. Click the **"Analytics"** button in the top right
2. You should see:
   - Total bottles count
   - Total value
   - Average price
   - Bottles by type (with colored progress bars)
   - Top wineries
   - Oldest bottle
   - Most expensive bottle
3. Click **"Back to Fridge"** to return

### Test 6: Desktop 3D View (if on desktop)

If you're on a laptop/desktop (screen width > 1024px):

1. Look for the **"3D View"** button in the top right
2. Click it to toggle to 3D mode
3. You should see:
   - 3D cylindrical wine bottles
   - Dark background
   - You can click and drag to rotate the view
   - Scroll to zoom in/out
4. Click **"2D Grid"** to go back

---

## Step 5: Test PWA Features (Mobile/Desktop)

### On Desktop (Chrome/Edge):

1. Look for the install icon in the address bar (⊕ or computer icon)
2. Click it and select "Install"
3. The app opens in its own window!
4. Try closing and reopening from your apps menu

### On Mobile:

1. Open the site in Safari (iOS) or Chrome (Android)
2. **iOS**: Tap Share → "Add to Home Screen"
3. **Android**: Tap menu (⋮) → "Install app" or "Add to Home Screen"
4. The app appears on your home screen with an icon!

---

## Troubleshooting

### "Failed to fetch bottles" error

**Problem**: Can't load bottles, error in console  
**Solution**:

1. Check `.env.local` has correct Supabase URL and key
2. Verify no extra spaces in the values
3. Restart the dev server: `Ctrl+C` then `npm run dev`

### "supabaseUrl is required" error

**Problem**: Environment variables not loading  
**Solution**:

1. Make sure file is named `.env.local` (not `.env.local.txt`)
2. File must be in project root (same folder as `package.json`)
3. Restart dev server after creating `.env.local`

### Empty grid but no errors

**Problem**: Database tables might not exist  
**Solution**:

1. Go back to Supabase SQL Editor
2. Run this to check tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```
3. Should show `bottles` and `consumption_history`
4. If not, re-run the migration from Step 1.2

### 3D view not showing

**Problem**: 3D toggle button doesn't appear  
**Solution**:

- 3D view only works on screens wider than 1024px
- Try making your browser window wider
- Or use a laptop/desktop instead of phone

### Port 3000 already in use

**Problem**: `Error: Port 3000 is already in use`  
**Solution**:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

---

## What to Test

Here's a checklist of things to try:

- [ ] Add a bottle to slot 1
- [ ] Add bottles of different types (red, white, rosé, sparkling)
- [ ] View bottle details by clicking
- [ ] Navigate between bottles with Previous/Next
- [ ] Mark a bottle as consumed
- [ ] Add tasting notes when consuming
- [ ] Rate a bottle (thumbs up/down)
- [ ] Check analytics page
- [ ] See bottles by type chart
- [ ] View top wineries
- [ ] Toggle 3D view (desktop only)
- [ ] Rotate and zoom in 3D view
- [ ] Install as PWA
- [ ] Test offline (disconnect wifi, app should still load)

---

## Sample Data

Want to quickly populate your fridge? Here's some sample data:

### Red Wines

1. Château Margaux, Margaux, 2015, $450, Score: 95
2. Opus One, Napa Valley, 2018, $350, Score: 94
3. Penfolds Grange, Shiraz, 2016, $600, Score: 98

### White Wines

4. Domaine Leflaive, Puligny-Montrachet, 2020, $85, Score: 93
5. Cloudy Bay, Sauvignon Blanc, 2022, $30, Score: 88

### Rosé

6. Château d'Esclans, Whispering Angel, 2022, $25, Score: 86

### Sparkling

7. Dom Pérignon, Champagne, 2012, $200, Score: 96
8. Veuve Clicquot, Brut, 2015, $60, Score: 90

---

## Next Steps

Once you've tested locally:

1. **Customize**: Edit colors in `tailwind.config.ts`
2. **Add Icons**: Replace placeholder icon files in `public/`
3. **Deploy**: Push to GitHub and deploy to Vercel (see SETUP.md)
4. **Share**: Show friends your wine collection!

---

## Getting Help

If you run into issues:

1. Check the browser console (F12 → Console tab)
2. Check the terminal where `npm run dev` is running
3. Review [SETUP.md](./SETUP.md) for detailed troubleshooting
4. Check [Supabase docs](https://supabase.com/docs) for database issues

---

## Success! 🎉

If you can:

- ✅ See the wine fridge grid
- ✅ Add bottles
- ✅ View details
- ✅ Mark as consumed
- ✅ See analytics

**You're all set!** The app is working perfectly. Now go add your real wine collection! 🍷

Enjoy tracking your wines with style!
