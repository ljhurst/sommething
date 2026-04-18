# Setup Guide

## Prerequisites

- Node.js 20+ installed
- A Supabase account (free tier works great)
- Git (for version control)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (takes ~2 minutes)
3. Go to the SQL Editor in your Supabase dashboard
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor and click "Run"
6. Verify the tables were created by checking the Table Editor

**Note**: If you're upgrading from a 30-bottle configuration, also run `supabase/migrations/002_update_to_24_bottles.sql` to update the slot constraints.

## Step 3: Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to Settings > API in your Supabase dashboard
   - Copy the "Project URL" and "anon public" key

3. Update `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test the App

1. Click an empty slot to add a bottle
2. Fill in the bottle details (winery, name, type, year, price)
3. Click "Add Bottle" to save
4. Click on a filled bottle to view details
5. Mark a bottle as consumed to test the consumption flow
6. Visit the Analytics page to see your collection insights

## Optional: Create App Icons

The app includes placeholder text files for icons. To create actual icons:

1. Create a 512x512px PNG image with your wine fridge logo
2. Save it as `public/icon-512.png`
3. Create a 192x192px version and save as `public/icon-192.png`
4. Delete the `.txt` placeholder files

Recommended tools:

- [Figma](https://figma.com) - Design tool
- [Favicon.io](https://favicon.io) - Generate icons from text/image
- [RealFaviconGenerator](https://realfavicongenerator.net) - Comprehensive icon generator

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

## Building for Production

```bash
npm run build
npm start
```

## Deploying to Vercel

**Live Example**: [https://sommething.vercel.app/](https://sommething.vercel.app/)  
**Vercel Dashboard**: [https://vercel.com/ljhursts-projects/sommething](https://vercel.com/ljhursts-projects/sommething)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

Vercel will automatically deploy on every push to your main branch.

## Troubleshooting

### "Failed to fetch bottles" error

- Check that your Supabase credentials are correct in `.env.local`
- Verify the database tables were created successfully
- Check the browser console for detailed error messages

### PWA not installing

- PWA features only work over HTTPS or on localhost
- Check that `manifest.json` is accessible at `/manifest.json`
- Verify service worker is registered in browser DevTools > Application > Service Workers

### 3D view not showing

- 3D view is only available on desktop (1024px+ width)
- Check browser console for WebGL errors
- Try a different browser (Chrome/Firefox recommended)

### Tests failing

- Make sure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that you're using Node.js 20+

## Next Steps

1. **Add real bottles**: Start tracking your wine collection!
2. **Customize colors**: Edit `tailwind.config.ts` to match your style
3. **Add authentication**: Implement Supabase Auth for multi-user support
4. **Deploy**: Share your wine collection with friends

## Support

For issues or questions:

- Check the [VISION.md](../product/VISION.md) for product details
- Review the [README.md](../../README.md) for technical overview
- Open an issue on GitHub

Enjoy tracking your wine collection! 🍷
