import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBottles } from '@/hooks/useBottles';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { BottleInstance, NewBottleInstance } from '@/lib/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('useBottles', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockBottles: BottleInstance[] = [
    {
      id: 'bottle-1',
      wine_id: 'wine-1',
      space_id: 'space-1',
      slot_position: 1,
      added_at: '2024-01-01T00:00:00Z',
      wine: {
        id: 'wine-1',
        created_by_user_id: 'user-123',
        winery: 'Test Winery',
        name: 'Test Wine',
        type: 'red' as const,
        year: 2020,
        price: 50,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'bottle-2',
      wine_id: 'wine-2',
      space_id: 'space-1',
      slot_position: 2,
      added_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchBottles', () => {
    it('should fetch bottles successfully when user is authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockBottles, error: null });
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ order: mockOrder });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBottles());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bottles).toEqual(mockBottles);
      expect(result.current.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('bottle_instances');
    });

    it('should return empty array when user is not authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useBottles());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bottles).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockError = new Error('Database error');
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ order: mockOrder });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBottles());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Database error');
      expect(result.current.bottles).toEqual([]);
    });

    it('should filter by spaceId when provided', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockBottles, error: null });
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      renderHook(() => useBottles('space-123'));

      await waitFor(() => {
        expect(mockEq).toHaveBeenCalledWith('space_id', 'space-123');
      });
    });
  });

  describe('addBottle', () => {
    it('should add a bottle successfully', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const newBottle: NewBottleInstance = {
        wine_id: 'wine-3',
        space_id: 'space-1',
        slot_position: 3,
      };

      const addedBottle: BottleInstance = {
        id: 'bottle-3',
        ...newBottle,
        added_at: '2024-01-02T00:00:00Z',
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: addedBottle, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const mockOrderSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
      mockOrderSelect.mockReturnValue({ order: mockOrder });

      const { result } = renderHook(() => useBottles());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const bottle = await result.current.addBottle(newBottle);

      expect(bottle).toEqual(addedBottle);
      expect(mockInsert).toHaveBeenCalledWith(newBottle);
    });

    it('should return null and set error when user is not authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useBottles());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newBottle: NewBottleInstance = {
        wine_id: 'wine-3',
        space_id: 'space-1',
        slot_position: 3,
      };

      const bottle = await result.current.addBottle(newBottle);

      await waitFor(() => {
        expect(result.current.error).toBe('You must be logged in to add bottles');
      });

      expect(bottle).toBeNull();
    });

    it('should handle insert errors', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockError = new Error('Insert failed');
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      const mockOrderSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });

      const mockFrom = vi.fn((table: string) => {
        if (table === 'bottle_instances') {
          return { insert: mockInsert, select: mockOrderSelect };
        }
        return { select: mockOrderSelect };
      });

      mockOrderSelect.mockReturnValue({ order: mockOrder });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBottles());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newBottle: NewBottleInstance = {
        wine_id: 'wine-3',
        space_id: 'space-1',
        slot_position: 3,
      };

      const bottle = await result.current.addBottle(newBottle);

      await waitFor(() => {
        expect(result.current.error).toBe('Insert failed');
      });

      expect(bottle).toBeNull();
    });
  });

  describe('updateBottle', () => {
    it('should update a bottle successfully', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockBottles, error: null });
      mockSelect.mockReturnValue({ order: mockOrder });

      const { result } = renderHook(() => useBottles());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const success = await result.current.updateBottle('bottle-1', { slot_position: 5 });

      expect(success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ slot_position: 5 });
      expect(mockEq).toHaveBeenCalledWith('id', 'bottle-1');
    });

    it('should handle update errors', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockError = new Error('Update failed');
      const mockEq = vi.fn().mockResolvedValue({ error: mockError });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });

      const mockFrom = vi.fn((table: string) => {
        if (table === 'bottle_instances') {
          return { update: mockUpdate, select: mockSelect };
        }
        return { select: mockSelect };
      });

      mockSelect.mockReturnValue({ order: mockOrder });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBottles());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const success = await result.current.updateBottle('bottle-1', { slot_position: 5 });

      await waitFor(() => {
        expect(result.current.error).toBe('Update failed');
      });

      expect(success).toBe(false);
    });
  });

  describe('deleteBottle', () => {
    it('should delete a bottle successfully', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockBottles, error: null });
      mockSelect.mockReturnValue({ order: mockOrder });

      const { result } = renderHook(() => useBottles());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const success = await result.current.deleteBottle('bottle-1');

      expect(success).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'bottle-1');
    });

    it('should handle delete errors', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockError = new Error('Delete failed');
      const mockEq = vi.fn().mockResolvedValue({ error: mockError });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });

      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });

      const mockFrom = vi.fn((table: string) => {
        if (table === 'bottle_instances') {
          return { delete: mockDelete, select: mockSelect };
        }
        return { select: mockSelect };
      });

      mockSelect.mockReturnValue({ order: mockOrder });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useBottles());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const success = await result.current.deleteBottle('bottle-1');

      await waitFor(() => {
        expect(result.current.error).toBe('Delete failed');
      });

      expect(success).toBe(false);
    });
  });
});
