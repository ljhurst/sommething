import { describe, it, expect } from 'vitest';
import { supabase } from '@/lib/supabase';

describe('Supabase Client', () => {
  it('should export supabase client', () => {
    expect(supabase).toBeDefined();
  });

  it('should have auth methods', () => {
    expect(supabase.auth).toBeDefined();
    expect(supabase.auth.signUp).toBeDefined();
    expect(supabase.auth.signInWithPassword).toBeDefined();
    expect(supabase.auth.signOut).toBeDefined();
  });

  it('should have from method for queries', () => {
    expect(supabase.from).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });
});
