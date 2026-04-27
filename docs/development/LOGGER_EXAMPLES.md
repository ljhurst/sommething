# Logger Implementation Examples

Quick reference for adding logging to Sommething codebase.

## Import

```typescript
import { logger } from '@/lib/logger';
```

## Quick Examples

### In Hooks (useBottles.ts)

```typescript
export function useBottles(spaceId?: string) {
  const fetchBottles = useCallback(async () => {
    logger.debug('Fetching bottles', { spaceId, userId: user?.id });

    try {
      const { data, error } = await supabase
        .from('bottle_instances')
        .select('*, wine:wines(*)')
        .eq('space_id', spaceId);

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

  const addBottle = async (bottle: NewBottleInstance) => {
    logger.userAction('add_bottle', user?.id, {
      spaceId: bottle.space_id,
      wineId: bottle.wine_id,
      slotPosition: bottle.slot_position,
    });

    try {
      const { data, error } = await supabase
        .from('bottle_instances')
        .insert(bottle)
        .select('*, wine:wines(*)')
        .single();

      if (error) throw error;

      logger.info('Bottle added successfully', {
        bottleId: data.id,
        wineId: data.wine_id,
        spaceId: data.space_id,
        userId: user?.id,
      });

      return data;
    } catch (err) {
      logger.error('Failed to add bottle', err, {
        bottle,
        userId: user?.id,
      });
      return null;
    }
  };
}
```

### In Components (wines/page.tsx)

```typescript
export default function WinesPage() {
  const handleAddWine = async (wine: Omit<NewWine, 'created_by_user_id'>) => {
    logger.userAction('add_wine_attempt', user?.id, {
      wineType: wine.type,
      winery: wine.winery,
      year: wine.year,
    });

    const newWine = await addWine(wine as NewWine);

    if (newWine) {
      logger.info('Wine added successfully', {
        wineId: newWine.id,
        wineName: newWine.name,
        winery: newWine.winery,
        userId: user?.id,
      });
      setWines((prev) => [newWine, ...prev]);
    } else {
      logger.warn('Wine creation returned null', {
        wine,
        userId: user?.id,
      });
    }
  };

  const handleSearch = async (query: string) => {
    const start = Date.now();

    logger.debug('Searching wines', { query, userId: user?.id });

    const results = await searchWines(query);

    logger.performance('wineSearch', Date.now() - start, {
      query,
      resultsCount: results.length,
      userId: user?.id,
    });

    setWines(results);
  };
}
```

### In Auth Context (AuthContext.tsx)

```typescript
const signIn = async (email: string, password: string) => {
  logger.debug('Sign in attempt', { email });

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.warn('Sign in failed', {
      email,
      errorCode: error.code,
      errorMessage: error.message,
    });
    return { error };
  }

  logger.info('User signed in successfully', { email });
  return { error: null };
};

const signOut = async () => {
  logger.userAction('sign_out', user?.id);

  await supabase.auth.signOut();

  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentSpaceId');
  }

  logger.info('User signed out', { userId: user?.id });
};
```

### Performance Tracking

```typescript
const fetchData = async () => {
  const start = Date.now();

  try {
    const data = await heavyOperation();

    logger.performance('heavyOperation', Date.now() - start, {
      dataSize: data.length,
      userId: user?.id,
    });

    return data;
  } catch (error) {
    logger.error('Heavy operation failed', error, {
      duration: Date.now() - start,
      userId: user?.id,
    });
    throw error;
  }
};
```

## Migration Checklist

To add logging to existing code:

1. ✅ Import logger at top of file
2. ✅ Add debug logs at function entry (development only)
3. ✅ Add info logs for successful operations
4. ✅ Add error logs with full context in catch blocks
5. ✅ Add user action logs for important user interactions
6. ✅ Add performance logs for operations >100ms
7. ✅ Test in development (check console output)
8. ✅ Verify structured data is correct

## Common Patterns

### API Call Pattern

```typescript
logger.apiCall('POST', '/api/wines', { wineData });

try {
  const response = await fetch('/api/wines', {
    method: 'POST',
    body: JSON.stringify(wineData),
  });

  logger.apiSuccess('POST', '/api/wines', {
    status: response.status,
    wineId: result.id,
  });
} catch (error) {
  logger.apiError('POST', '/api/wines', error, { wineData });
}
```

### CRUD Pattern

```typescript
// Create
logger.userAction('create_resource', user.id, { resourceType, data });

// Read
logger.debug('Fetching resource', { resourceId, userId });

// Update
logger.userAction('update_resource', user.id, {
  resourceId,
  resourceType,
  updatedFields: Object.keys(updates),
});

// Delete
logger.userAction('delete_resource', user.id, {
  resourceId,
  resourceType,
});
```

### Error Handling Pattern

```typescript
try {
  // Operation
} catch (error) {
  logger.error('Operation failed', error, {
    userId: user?.id,
    operation: 'operationName',
    context: relevantData,
  });

  // Handle error (show toast, etc.)
}
```

## What to Log in Sommething

### High Priority (Implement First)

- User authentication (login, logout, signup)
- Wine CRUD operations
- Bottle CRUD operations
- Space CRUD operations
- Space switching
- Bottle consumption

### Medium Priority

- API errors from Supabase
- Navigation events
- Search operations
- Filter applications

### Low Priority (Development Only)

- Component renders
- State updates
- Validation steps
- Cache hits/misses

## Tips

1. **Always include userId** - Makes debugging user-specific issues easy
2. **Use descriptive action names** - `add_wine` not `click` or `submit`
3. **Log before and after** - Entry point with debug, exit with info/error
4. **Context over quantity** - One good log with context beats 10 without
5. **Think about filtering** - What would you search for when debugging?
