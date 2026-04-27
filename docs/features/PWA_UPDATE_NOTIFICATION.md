# PWA Update Notification System

## Overview

Automatic update detection and notification system for the Progressive Web App, ensuring users always have the latest version when installed on their iPhone home screen.

## Implementation Date

April 26, 2026

## The Problem

When a PWA is saved to the iPhone home screen, it doesn't have a traditional browser refresh button. Users were stuck with cached versions even when updates were deployed because:

1. Service Worker caches the app aggressively for offline support
2. Updates install in the background but don't activate immediately
3. No browser UI to prompt for reload
4. Users had to force-close the app or delete/reinstall

## The Solution

Implemented a complete update detection and notification system that:

1. **Detects Updates**: Checks for new service worker versions every 60 seconds
2. **Notifies Users**: Shows an elegant toast notification when updates are available
3. **Easy Update**: One-click reload to get the latest version
4. **Non-Intrusive**: Users can dismiss and update later if busy

## How It Works

### Service Worker Updates

**File: `public/sw.js`**

- Version bump: `CACHE_NAME = 'sommething-v3'`
- Added `self.clients.claim()` in activate event to take control immediately
- Old caches are automatically deleted when new version activates

### Update Detection

**File: `src/components/UpdateNotification.tsx`**

```typescript
// Listens for service worker updates
registration.addEventListener('updatefound', () => {
  const newWorker = registration.installing;
  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
    setShowUpdate(true); // Show notification
  }
});

// Check for updates every 60 seconds
setInterval(() => {
  registration.update();
}, 60000);
```

### Update Notification UI

**Component: `UpdateNotification`**

- Fixed position toast at bottom of screen (bottom-right on desktop, full-width on mobile)
- Wine-red theme matching app design
- Lightning bolt icon for visual appeal
- Two actions:
  - **Reload Now**: Immediately refresh to get updates
  - **Later**: Dismiss notification (will show again on next check)
- Smooth slide-up animation

### Integration

**File: `src/app/layout.tsx`**

- Added `<UpdateNotification />` component to root layout
- Renders on all pages
- Handles all update detection logic internally

## User Experience

### Update Flow

1. **User opens PWA** from home screen
2. **Background check** happens automatically
3. **Update detected** (new service worker available)
4. **Toast appears** with friendly message
5. **User clicks "Reload Now"** or dismisses
6. **Page refreshes** and new version loads
7. **User sees latest features** immediately

### Visual Design

- **Color**: Wine-red background (#722F37) with white text
- **Position**: Bottom-right on desktop, bottom full-width on mobile
- **Animation**: Smooth slide-up entrance
- **Icons**: Lightning bolt for "update available"
- **Buttons**: White primary action, translucent secondary
- **Shadow**: Elevated with shadow for prominence

## Technical Details

### Update Check Frequency

- **Initial**: On app load
- **Periodic**: Every 60 seconds (1 minute)
- **Manual**: When user navigates between pages

### Cache Strategy

```javascript
// Network-first with cache fallback
fetch(request)
  .then(cache)
  .catch(() => serveCached);
```

### Version Management

To deploy a new version:

1. Make code changes
2. Increment `CACHE_NAME` in `public/sw.js` (e.g., `v3` → `v4`)
3. Deploy to Vercel
4. Users will see update notification within 60 seconds

### Browser Support

- **iOS Safari**: Full support (primary target)
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Legacy Browsers**: Gracefully degrades (no notification, but still works)

## Manual Update Methods (Backup)

If the automatic system fails, users can still update:

### Method 1: Force Close

1. Swipe up from bottom of iPhone
2. Swipe away Sommething app
3. Reopen from home screen

### Method 2: Delete & Re-add

1. Long press app icon
2. Delete from home screen
3. Open Safari and visit site
4. Add to home screen again

### Method 3: Clear Safari Data

1. Settings → Safari → Clear History and Website Data
2. Reopen PWA from home screen

## Files Changed

### New Files

- `src/components/UpdateNotification.tsx` - Update notification component

### Modified Files

- `public/sw.js` - Version bump + `clients.claim()`
- `src/lib/pwa.ts` - Simplified (detection moved to component)
- `src/app/layout.tsx` - Added UpdateNotification component
- `tailwind.config.ts` - Added slide-up animation

## Testing

All validations pass:

- Type checking: ✅
- Linting: ✅
- Formatting: ✅
- Unit tests: ✅ (91 tests)

## Testing Update Flow

To test the update notification:

1. Deploy current version
2. Open PWA on iPhone
3. Make a code change
4. Increment `CACHE_NAME` to `v4`
5. Deploy new version
6. Within 60 seconds, update notification appears
7. Click "Reload Now"
8. New version loads

## Future Enhancements

1. **Release Notes**
   - Show changelog in notification
   - "What's New" modal on first launch after update

2. **Smart Update Timing**
   - Detect when user is idle
   - Auto-update during inactivity
   - Avoid interrupting active tasks

3. **Update History**
   - Log update timestamps
   - Show version number in settings
   - Display last update time

4. **Offline Detection**
   - Defer update checks when offline
   - Batch checks on reconnection

5. **Update Analytics**
   - Track update success rate
   - Monitor how quickly users update
   - Identify update friction points

## Best Practices

### When to Increment Version

- After any user-facing code change
- After bug fixes
- After new features
- After UI/UX improvements
- NOT for internal/test changes

### Version Naming

Use semantic-like versioning:

- `v1` → Initial release
- `v2` → Major feature (Space Switcher)
- `v3` → Update system (this release)
- `v4` → Next major feature

### Communication

Consider adding:

- Version number in app footer
- "What's new" link in sidebar
- Release notes page

## Related Features

- PWA Configuration (`manifest.json`)
- Service Worker (`sw.js`)
- Offline Support
- App Icon Installation
