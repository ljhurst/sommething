import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, useUser } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe('AuthContext', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
  } as User;

  const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  } as Session;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AuthProvider', () => {
    it('should initialize with loading state', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should load session on mount', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });

    it('should handle no session on mount', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should set up auth state change listener', async () => {
      const mockUnsubscribe = vi.fn();
      const mockCallback = vi.fn();

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        mockCallback.mockImplementation(callback);
        return {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        } as ReturnType<typeof supabase.auth.onAuthStateChange>;
      });

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signUp('test@example.com', 'password123');

      expect(response.error).toBeNull();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return error on sign up failure', async () => {
      const mockUnsubscribe = vi.fn();
      const mockError = {
        message: 'Sign up failed',
        name: 'AuthError',
        status: 400,
      } as unknown as AuthError;

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signUp('test@example.com', 'weak');

      expect(response.error).toEqual(mockError);
    });
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signIn('test@example.com', 'password123');

      expect(response.error).toBeNull();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return error on sign in failure', async () => {
      const mockUnsubscribe = vi.fn();
      const mockError = {
        message: 'Invalid credentials',
        name: 'AuthError',
        status: 401,
      } as unknown as AuthError;

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signIn('test@example.com', 'wrongpass');

      expect(response.error).toEqual(mockError);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('useAuth', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });

  describe('useUser', () => {
    it('should return user from context', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);

      const { result } = renderHook(() => useUser(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current).toEqual(mockUser);
      });
    });

    it('should return null when no user is authenticated', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);

      const { result } = renderHook(() => useUser(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current).toBeNull();
      });
    });
  });
});
