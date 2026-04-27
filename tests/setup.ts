import '@testing-library/jest-dom';
import { beforeAll, afterAll } from 'vitest';

// Set up test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Suppress act() warnings from React Testing Library hook tests
// These are false positives when using renderHook with waitFor - the async
// state updates are properly handled by waitFor, but React still warns.
// This is a known limitation when testing hooks with async operations.
const originalError = console.error;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const message = String(args[0]);
    if (message.includes('inside a test was not wrapped in act')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
