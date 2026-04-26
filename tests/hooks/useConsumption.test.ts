import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useConsumption } from '@/hooks/useConsumption';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { BottleInstance, Consumption, Rating } from '@/lib/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('useConsumption', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockBottle: BottleInstance = {
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
  };

  const mockConsumptions: Consumption[] = [
    {
      id: 'consumption-1',
      wine_id: 'wine-1',
      consumed_by_user_id: 'user-123',
      space_id: 'space-1',
      consumed_at: '2024-01-02T00:00:00Z',
      notes: 'Great wine',
      rating: 'thumbs_up' as Rating,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('consumeBottle', () => {
    it('should consume a bottle successfully', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn((table: string) => {
        if (table === 'consumptions') {
          return { insert: mockInsert };
        }
        return { delete: mockDelete };
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useConsumption());

      const success = await result.current.consumeBottle({
        bottle: mockBottle,
        notes: 'Excellent',
        rating: 'thumbs_up' as Rating,
      });

      expect(success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockInsert).toHaveBeenCalledWith({
        wine_id: 'wine-1',
        consumed_by_user_id: 'user-123',
        space_id: 'space-1',
        notes: 'Excellent',
        rating: 'thumbs_up',
      });
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'bottle-1');
    });

    it('should return false when user is not authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => useConsumption());

      const success = await result.current.consumeBottle({ bottle: mockBottle });

      await waitFor(() => {
        expect(result.current.error).toBe('You must be logged in to consume bottles');
      });

      expect(success).toBe(false);
    });

    it('should return false when bottle data is invalid', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const invalidBottle: BottleInstance = {
        ...mockBottle,
        wine_id: '',
      };

      const { result } = renderHook(() => useConsumption());

      const success = await result.current.consumeBottle({ bottle: invalidBottle });

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid bottle data');
      });

      expect(success).toBe(false);
    });

    it('should handle consumption insert errors', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockError = new Error('Insert failed');
      const mockInsert = vi.fn().mockResolvedValue({ error: mockError });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useConsumption());

      const success = await result.current.consumeBottle({ bottle: mockBottle });

      await waitFor(() => {
        expect(result.current.error).toBe('Insert failed');
      });

      expect(success).toBe(false);
    });

    it('should handle bottle delete errors', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockError = new Error('Delete failed');
      const mockEq = vi.fn().mockResolvedValue({ error: mockError });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn((table: string) => {
        if (table === 'consumptions') {
          return { insert: mockInsert };
        }
        return { delete: mockDelete };
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useConsumption());

      const success = await result.current.consumeBottle({ bottle: mockBottle });

      await waitFor(() => {
        expect(result.current.error).toBe('Delete failed');
      });

      expect(success).toBe(false);
    });

    it('should handle consumption without notes or rating', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn((table: string) => {
        if (table === 'consumptions') {
          return { insert: mockInsert };
        }
        return { delete: mockDelete };
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useConsumption());

      const success = await result.current.consumeBottle({ bottle: mockBottle });

      expect(success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          wine_id: 'wine-1',
          consumed_by_user_id: 'user-123',
          space_id: 'space-1',
        })
      );
    });
  });

  describe('getConsumptionHistory', () => {
    it('should fetch consumption history successfully', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const mockOrder = vi.fn().mockResolvedValue({ data: mockConsumptions, error: null });
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      mockSelect.mockReturnValue({ order: mockOrder });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useConsumption());

      const history = await result.current.getConsumptionHistory();

      expect(history).toEqual(mockConsumptions);
      expect(result.current.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('consumptions');
      expect(mockOrder).toHaveBeenCalledWith('consumed_at', { ascending: false });
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

      const { result } = renderHook(() => useConsumption());

      const history = await result.current.getConsumptionHistory();

      expect(history).toEqual([]);
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

      interface MockQuery {
        eq: ReturnType<typeof vi.fn>;
      }
      let capturedQuery: MockQuery;
      const mockEq = vi.fn((_field, _value) => {
        return { data: mockConsumptions, error: null };
      });
      const mockOrder = vi.fn((_field, _options) => {
        capturedQuery = { eq: mockEq };
        return capturedQuery;
      });
      const mockSelect = vi.fn(() => ({ order: mockOrder }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useConsumption());

      await result.current.getConsumptionHistory('space-123');

      await waitFor(() => {
        expect(mockEq).toHaveBeenCalledWith('space_id', 'space-123');
      });
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

      const mockError = new Error('Fetch failed');
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockSelect = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      mockSelect.mockReturnValue({ order: mockOrder });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const { result } = renderHook(() => useConsumption());

      const history = await result.current.getConsumptionHistory();

      await waitFor(() => {
        expect(result.current.error).toBe('Fetch failed');
      });

      expect(history).toEqual([]);
    });
  });
});
