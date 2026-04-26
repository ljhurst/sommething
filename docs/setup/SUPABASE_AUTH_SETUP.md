# Supabase Auth Setup Guide

This guide walks you through enabling authentication in your Supabase project for Sommething.

## Prerequisites

- Supabase project created
- Database migrations run (including `005_add_user_auth.sql`)

## Step 1: Enable Email Authentication

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Email** provider
5. Toggle it to **Enabled**
6. Configure settings:
   - **Enable Email Confirmations**: Recommended (toggle ON)
   - **Enable Email Autoconfirm**: Optional for development (toggle ON for easier testing)
   - **Secure Email Change**: Recommended (toggle ON)
   - **Secure Password Change**: Recommended (toggle ON)

### Email Templates (Optional)

Customize the email templates users receive:

1. Go to **Authentication** → **Email Templates**
2. Customize:
   - Confirmation email
   - Magic link email
   - Password reset email
   - Email change confirmation

## Step 2: Configure Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**:
   - Local development: `http://localhost:3000`
   - Production: `https://sommething.vercel.app` (or your domain)
3. Add **Redirect URLs** (comma-separated):
   ```
   http://localhost:3000,
   http://localhost:3000/**,
   https://sommething.vercel.app,
   https://sommething.vercel.app/**
   ```

## Step 3: Run Database Migration

Run the auth migration in your Supabase SQL Editor:

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/005_add_user_auth.sql`
4. Click **Run** or press `Ctrl+Enter` / `Cmd+Enter`

The migration will:

- Add `user_id` columns to `bottles` and `consumption_history` tables
- Create indexes for performance
- Update RLS policies to filter by authenticated user
- Ensure users can only see and modify their own data

## Step 4: Test Authentication

### Local Testing

1. Start your dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Click **Sign In**
4. Create a new account with your email
5. Check your email for confirmation (if email confirmations are enabled)
6. Sign in with your credentials

### Verify User Isolation

To test that users can only see their own bottles:

1. Sign up with User A (e.g., `user-a@example.com`)
2. Add some bottles
3. Sign out
4. Sign up with User B (e.g., `user-b@example.com`)
5. Verify you don't see User A's bottles
6. Add bottles for User B
7. Sign out and sign back in as User A
8. Verify you only see User A's bottles

## Step 5: Optional OAuth Providers

### Google Authentication

1. Go to **Authentication** → **Providers**
2. Find **Google** provider
3. Toggle to **Enabled**
4. Follow Supabase's guide to:
   - Create Google OAuth credentials
   - Add authorized redirect URIs
   - Enter Client ID and Secret in Supabase

### GitHub Authentication

1. Go to **Authentication** → **Providers**
2. Find **GitHub** provider
3. Toggle to **Enabled**
4. Follow Supabase's guide to:
   - Create GitHub OAuth App
   - Add callback URL
   - Enter Client ID and Secret in Supabase

## Development vs Production Settings

### Development (Autoconfirm ON)

- Users can sign up instantly without email verification
- Faster testing and development
- Less secure

### Production (Autoconfirm OFF)

- Users must verify their email address
- More secure
- Better user experience (prevents fake accounts)

**Recommendation**: Use autoconfirm in local development, disable in production.

## Troubleshooting

### "Invalid login credentials" error

- Check that email and password are correct
- Verify email confirmation was completed (if required)
- Check Supabase logs: **Authentication** → **Logs**

### "You must be logged in" errors

- Ensure `005_add_user_auth.sql` migration ran successfully
- Check browser console for auth errors
- Verify Supabase credentials in `.env.local`

### RLS Policy errors ("new row violates row-level security policy")

- Ensure user is authenticated (check browser console)
- Verify RLS policies are correctly set up
- Check Supabase logs: **Database** → **Logs**

### Session not persisting

- Check that cookies are enabled in browser
- Verify `auth.persistSession` is `true` in `supabase.ts` (already configured)
- Clear browser cache and try again

## Security Best Practices

1. **Never commit `.env.local`** - Keep Supabase credentials secret
2. **Enable email confirmations in production** - Prevents spam accounts
3. **Use strong password requirements** - Configure in Supabase auth settings
4. **Monitor auth logs** - Check for suspicious activity
5. **Keep Supabase client up to date** - Run `npm update @supabase/supabase-js`

## Next Steps

- [ ] Enable OAuth providers (Google, GitHub) for easier sign-in
- [ ] Customize email templates with your branding
- [ ] Add password reset functionality to the UI
- [ ] Implement magic link authentication (passwordless)
- [ ] Add user profile management

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth UI Components](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
