# Logging Guide

## Overview

Sommething uses a structured logging system that encourages adding context to every log entry. This makes debugging easier and enables better production monitoring.

## Logger API

### Basic Methods

```typescript
import { logger } from '@/lib/logger';

// Debug - Development only, verbose details
logger.debug('Detailed information', { userId, spaceId, step: 'validation' });

// Info - Important events and user actions
logger.info('User logged in', { userId, email, method: 'password' });

// Warn - Potential issues that don't break functionality
logger.warn('Deprecated feature used', { feature: 'oldAPI', userId });

// Error - Failures that need attention
logger.error('Failed to save data', error, { userId, operation: 'createWine' });
```

### Convenience Methods

For common patterns, use specialized methods:

```typescript
// User actions
logger.userAction('add_wine', user.id, {
  wineId: wine.id,
  wineName: wine.name,
  spaceId: currentSpace.id,
});

// API calls
logger.apiCall('POST', '/wines', { wineData });
logger.apiSuccess('POST', '/wines', { wineId: result.id });
logger.apiError('POST', '/wines', error, { wineData });

// Performance tracking
const start = Date.now();
// ... operation ...
logger.performance('fetchBottles', Date.now() - start, { spaceId, count });
```

## Structured Logging

Always include relevant context as an object:

### ❌ Bad - Unstructured

```typescript
logger.info(`User ${userId} added wine ${wineName} to space ${spaceId}`);
// Hard to parse, can't filter by fields
```

### ✅ Good - Structured

```typescript
logger.info('Wine added to space', {
  userId,
  wineId,
  wineName,
  spaceId,
  spaceName,
  timestamp: Date.now(),
});
// Easy to filter, search, and aggregate
```

## Usage Examples

### In Hooks

```typescript
// src/hooks/useBottles.ts
export function useBottles(spaceId?: string) {
  const fetchBottles = useCallback(async () => {
    logger.debug('Fetching bottles', { spaceId, userId: user?.id });

    try {
      const { data, error } = await supabase.from('bottle_instances').select('*');

      if (error) throw error;

      logger.info('Bottles fetched successfully', {
        spaceId,
        count: data.length,
        userId: user?.id,
      });

      setBottles(data);
    } catch (err) {
      logger.error('Failed to fetch bottles', err, {
        spaceId,
        userId: user?.id,
        operation: 'fetchBottles',
      });
      setError(err.message);
    }
  }, [user, spaceId]);
}
```

### In Components

```typescript
// src/app/wines/page.tsx
export default function WinesPage() {
  const handleAddWine = async (wine: NewWine) => {
    logger.userAction('add_wine', user?.id, {
      wineType: wine.type,
      winery: wine.winery,
    });

    try {
      const result = await addWine(wine);

      logger.info('Wine added successfully', {
        userId: user?.id,
        wineId: result.id,
        wineName: result.name,
      });
    } catch (error) {
      logger.error('Failed to add wine', error, {
        userId: user?.id,
        wineData: wine,
      });
    }
  };
}
```

### In Auth Flow

```typescript
// src/contexts/AuthContext.tsx
const signIn = async (email: string, password: string) => {
  logger.debug('Sign in attempt', { email });

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      logger.warn('Sign in failed', { email, reason: error.message });
      return { error };
    }

    logger.info('User signed in', { email });
    return { error: null };
  } catch (err) {
    logger.error('Sign in error', err, { email });
    return { error: err };
  }
};
```

## What to Log

### ✅ Do Log

- **User actions**: Login, logout, CRUD operations
- **API calls**: Request/response details, errors
- **State changes**: Space selection, navigation
- **Errors**: All caught errors with full context
- **Performance**: Slow operations (>1s)
- **Business events**: Wine consumed, space created

### ❌ Don't Log

- **Passwords**: Never log credentials
- **Tokens**: Auth tokens, API keys
- **PII**: Unless necessary and properly handled
- **High-frequency events**: Every render, mouse move
- **Noise**: Verbose internal operations

## Log Levels

Use the appropriate level for each situation:

### Debug (Development Only)

- Detailed execution flow
- Variable states
- Function entry/exit
- Validation steps

```typescript
logger.debug('Validating wine data', { wine, schema });
```

### Info

- Successful operations
- User actions
- State changes
- Important milestones

```typescript
logger.info('Space created', { spaceId, spaceName, userId });
```

### Warn

- Deprecated features used
- Recoverable errors
- Performance issues
- Unusual but valid states

```typescript
logger.warn('API rate limit approaching', { remaining: 10, total: 100 });
```

### Error

- Operation failures
- Unhandled exceptions
- Data inconsistencies
- Integration failures

```typescript
logger.error('Database query failed', error, { query, params });
```

## Production Considerations

### Current Behavior

- `debug` logs are stripped in production (not logged)
- `info`, `warn`, `error` logs go to console
- `error` logs have a hook for external services (TODO)

### Future Integration

To add production error tracking (e.g., Sentry):

```typescript
// In logger.ts, update sendToExternalService:
private sendToExternalService(entry: LogEntry): void {
  if (typeof window !== 'undefined' && window.Sentry) {
    Sentry.captureException(entry.error, {
      level: entry.level,
      tags: { timestamp: entry.timestamp },
      extra: entry.context,
    });
  }
}
```

## Performance

Logging has minimal performance impact:

- String formatting is lazy (only when needed)
- Debug logs are no-op in production
- No synchronous I/O operations
- Structured data uses JSON.stringify sparingly

## Testing

Logs don't interfere with tests:

```typescript
// In tests, logger output goes to test console
// Mock logger if needed:
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));
```

## Best Practices

1. **Be consistent**: Use the same structure for similar events
2. **Include context**: Always add relevant IDs and details
3. **Use meaningful messages**: Describe what happened, not how
4. **Think about filtering**: What would you search for when debugging?
5. **Don't over-log**: Focus on important events and errors
6. **Update on errors**: If you catch an error, log it before handling

## Examples by Feature

### Space Management

```typescript
logger.userAction('create_space', user.id, {
  spaceName: space.name,
  spaceType: space.space_type,
  capacity: space.rows * space.columns,
});

logger.userAction('switch_space', user.id, {
  fromSpaceId: oldSpace.id,
  toSpaceId: newSpace.id,
  toSpaceName: newSpace.name,
});
```

### Wine Management

```typescript
logger.userAction('add_wine', user.id, {
  wineId: wine.id,
  wineName: wine.name,
  winery: wine.winery,
  type: wine.type,
  year: wine.year,
});

logger.userAction('edit_wine', user.id, {
  wineId: wine.id,
  updatedFields: Object.keys(updates),
});
```

### Bottle Operations

```typescript
logger.userAction('add_bottle', user.id, {
  bottleId: bottle.id,
  wineId: bottle.wine_id,
  spaceId: bottle.space_id,
  slotPosition: bottle.slot_position,
});

logger.userAction('consume_bottle', user.id, {
  bottleId: bottle.id,
  wineId: bottle.wine_id,
  rating: rating,
  hasNotes: !!notes,
});
```

## Migration Guide

To add logging to existing code:

1. Import logger: `import { logger } from '@/lib/logger';`
2. Identify key events (user actions, errors)
3. Add structured logging with context
4. Test in development
5. Deploy to production

Start with error logging, then add info for user actions, finally add debug for development troubleshooting.
